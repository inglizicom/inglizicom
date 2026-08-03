'use client'

import { useEffect, useState } from 'react'
import {
  Award, BookOpen, Camera, CalendarClock, Clock, Flame, GraduationCap,
  Image as ImageIcon, Languages, Loader2, MessageSquareQuote, Pencil,
  ShieldCheck, Sparkles, Star, Trophy, Users, Video, XCircle, FlaskConical,
} from 'lucide-react'
import { useTeacher } from '@/lib/teacher-context'
import {
  fetchTeacherProfileFull, uploadTeacherAvatar, uploadTeacherCover,
  type TeacherProfileFull,
} from '@/lib/teachers'
import { Donut, HBars, Ring, VIZ } from '../_charts'
import { Empty, Pill, Stars, fmtTime, STATUS_AR } from '../_ui'
import ProfileEditor from './ProfileEditor'
import { DEMO_PROFILE } from './demoData'

/**
 * The tutor page.
 *
 * Layout is a hero plus a two-column grid rather than a stack of full-width
 * cards — a stack reads as a document, and this is a profile. The hero carries
 * its own stats as glass tiles so the first screen is identity + numbers, not
 * identity then a wall of white boxes.
 *
 * Declared blocks are editable; computed blocks have no editing affordance at
 * all. `?demo=1` swaps in an in-memory dataset so the design can be judged with
 * real density before any student exists.
 */
export default function TeacherProfilePage() {
  const teacher = useTeacher()
  const [full, setFull]       = useState<TeacherProfileFull | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [demo, setDemo]       = useState(false)
  const [busyCover, setBusyCover]   = useState(false)
  const [busyAvatar, setBusyAvatar] = useState(false)

  async function load() {
    const isDemo = typeof window !== 'undefined'
      && new URLSearchParams(window.location.search).get('demo') === '1'
    setDemo(isDemo)
    if (isDemo) { setFull(DEMO_PROFILE); setLoading(false); return }
    setFull(await fetchTeacherProfileFull(teacher.id))
    setLoading(false)
  }
  useEffect(() => { load() /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [teacher.id])

  if (loading) {
    return <div className="py-32 flex justify-center text-stone-400"><Loader2 size={20} className="animate-spin" /></div>
  }
  if (!full) {
    return <Panel className="p-10 text-center font-black text-stone-600">تعذّر تحميل الملف الشخصي.</Panel>
  }

  const p = full.profile
  const s = full.stats
  const name = p.display_name || full.identity.full_name || 'أستاذ'

  async function onCover(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f || demo) return
    setBusyCover(true); await uploadTeacherCover(teacher.id, f); await load(); await teacher.refresh(); setBusyCover(false)
  }
  async function onAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f || demo) return
    setBusyAvatar(true); await uploadTeacherAvatar(teacher.id, f); await load(); await teacher.refresh(); setBusyAvatar(false)
  }

  return (
    <div className="space-y-4">

      {demo && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-fuchsia-50 border border-fuchsia-200 px-4 py-3">
          <FlaskConical size={16} className="text-fuchsia-600 shrink-0" />
          <span className="text-[13px] font-bold text-fuchsia-900">
            معاينة ببيانات وهمية — لا شيء هنا حقيقي. احذف <code className="font-mono">?demo=1</code> للعودة إلى ملفك.
          </span>
        </div>
      )}

      {/* ═══ Hero ═══════════════════════════════════════ */}
      <section className="relative rounded-3xl overflow-hidden shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-700 via-indigo-700 to-fuchsia-600" />
        {p.cover_url && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={p.cover_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/40 to-transparent" />
        <div className="absolute -top-24 -left-16 w-72 h-72 rounded-full bg-amber-400/25 blur-3xl" aria-hidden />

        <div className="relative p-5 sm:p-7 pt-24 sm:pt-32 text-white">
          <div className="absolute top-4 left-4 flex gap-2">
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/35 backdrop-blur text-white text-[11.5px] font-bold cursor-pointer hover:bg-black/55 transition">
              {busyCover ? <Loader2 size={13} className="animate-spin" /> : <ImageIcon size={13} />}
              الغلاف
              <input type="file" accept="image/*" hidden onChange={onCover} disabled={demo} />
            </label>
            <button
              onClick={() => !demo && setEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-stone-900 text-[11.5px] font-black hover:bg-stone-100 transition disabled:opacity-50"
              disabled={demo}
            >
              <Pencil size={13} /> تعديل
            </button>
          </div>

          {s.is_top_rated && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400 text-stone-900 text-[12px] font-black shadow-lg">
              <Trophy size={13} /> أستاذ متميّز
            </div>
          )}

          <div className="flex flex-wrap items-end gap-5">
            <div className="relative shrink-0">
              {p.avatar_url
                ? /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={p.avatar_url} alt="" className="w-28 h-28 rounded-3xl object-cover border-4 border-white/90 shadow-xl" />
                : <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 text-white border-4 border-white/90 shadow-xl flex items-center justify-center text-5xl font-black">
                    {name.trim().charAt(0)}
                  </div>}
              <label className="absolute -bottom-1 -left-1 w-9 h-9 rounded-full bg-stone-900 text-white flex items-center justify-center shadow-lg cursor-pointer hover:bg-stone-700 transition">
                {busyAvatar ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                <input type="file" accept="image/*" hidden onChange={onAvatar} disabled={demo} />
              </label>
            </div>

            <div className="flex-1 min-w-[15rem]">
              <h1 className="font-display text-[32px] sm:text-[42px] font-black tracking-tight leading-none drop-shadow-sm">{name}</h1>
              <p className="text-[15px] sm:text-[16px] font-bold text-amber-200 mt-2">
                {p.tagline || 'أضف جملة تصف ما تُتقنه أكثر'}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-[12.5px] font-black">
                  <Star size={12} className="fill-amber-300 text-amber-300" />
                  {s.rating_count ? Number(s.rating_avg).toFixed(1) : '—'}
                  <span className="text-white/60 font-semibold">({s.rating_count})</span>
                </span>
                {p.english_level && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-[12.5px] font-bold">
                    <Languages size={12} /> {p.english_level}
                  </span>
                )}
                {p.years_experience != null && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-[12.5px] font-bold">
                    <Clock size={12} /> {p.years_experience} سنوات خبرة
                  </span>
                )}
                {p.languages.map(l => (
                  <span key={l} className="px-3 py-1 rounded-full bg-white/10 backdrop-blur text-[12px] font-bold">{l}</span>
                ))}
              </div>
            </div>
          </div>

          {/* glass stats — identity and numbers on the same screen */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6">
            <Glass icon={Users}         label="طالباً"        value={s.students_total} sub={`${s.students_active} نشط`} />
            <Glass icon={GraduationCap} label="حصة أُنجزت"    value={s.classes_done}   sub={`${s.hours_total} ساعة`} />
            <Glass icon={ShieldCheck}   label="امتحان صُحّح"  value={s.exams_corrected} sub={`${s.exams_passed} ناجح`} />
            <Glass icon={CalendarClock} label="نسبة الحضور"   value={s.attendance_rate != null ? `${s.attendance_rate}%` : '—'} sub={`${s.reports_written} تقرير`} />
          </div>
        </div>
      </section>

      {/* ═══ Body: main + sidebar ═══════════════════════ */}
      <div className="grid lg:grid-cols-3 gap-4 items-start">

        {/* ── Main column ───────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">

          <Panel className="p-5 sm:p-6">
            <Head icon={Sparkles} tone="violet">نبذة</Head>
            <p className="text-[14.5px] leading-[1.95] text-stone-600 whitespace-pre-wrap">
              {p.bio || 'لا نبذة بعد — اضغط «تعديل».'}
            </p>
            {p.competences.length > 0 && (
              <div className="mt-5 pt-5 border-t border-stone-100">
                <h4 className="text-[12px] font-black text-stone-400 mb-2.5">المهارات والكفاءات</h4>
                <div className="flex flex-wrap gap-2">
                  {p.competences.map((c, i) => (
                    <span key={c} className={`px-3 py-1.5 rounded-lg text-[12.5px] font-bold border ${CHIP[i % CHIP.length]}`}>{c}</span>
                  ))}
                </div>
              </div>
            )}
          </Panel>

          {/* Schedule */}
          <Panel className="p-5 sm:p-6">
            <Head icon={CalendarClock} tone="blue" note="الأسبوعان القادمان">جدول الحصص</Head>
            {full.upcoming.length === 0 ? (
              <Empty icon={CalendarClock} title="لا حصص مبرمجة" hint="الحصص التي تبرمجها تظهر هنا بتوقيتها وعنوانها." />
            ) : (
              <div className="space-y-2">
                {full.upcoming.map((u, i) => (
                  <div key={u.id}
                       className={`flex items-center gap-4 p-3 rounded-2xl border transition ${
                         i === 0 ? 'border-blue-300 bg-blue-50/60' : 'border-stone-200 hover:border-blue-200'}`}>
                    <div className={`w-16 text-center shrink-0 py-1.5 rounded-xl ${i === 0 ? 'bg-blue-600 text-white' : 'bg-stone-100 text-stone-700'}`}>
                      <div className={`text-[10.5px] font-bold ${i === 0 ? 'text-blue-100' : 'text-stone-400'}`}>
                        {new Date(u.starts_at).toLocaleDateString('ar-MA', { weekday: 'short' })}
                      </div>
                      <div className="text-[15px] font-black tabular-nums leading-tight">{fmtTime(u.starts_at)}</div>
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
                         className="p-2.5 rounded-xl bg-stone-900 text-white hover:bg-stone-700 transition shrink-0" aria-label="دخول">
                        <Video size={15} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Panel>

          {/* Top students */}
          <Panel className="p-5 sm:p-6">
            <Head icon={Trophy} tone="amber" note="النقاط · المواظبة · الامتحانات">أبرز طلابي</Head>
            {full.top_students.length === 0 ? (
              <Empty icon={Users} title="لا طلاب مسنَدين بعد" hint="تُسنِد الإدارة الطلاب إليك، وتظهر نتائجهم هنا تلقائياً." />
            ) : (
              <div className="overflow-x-auto -mx-1">
                <table className="w-full text-sm min-w-[32rem]">
                  <thead>
                    <tr className="text-[11px] font-black text-stone-400 border-b border-stone-200">
                      <th className="text-right pb-2 pr-1">#</th>
                      <th className="text-right pb-2">الطالب</th>
                      <th className="text-center pb-2">المستوى</th>
                      <th className="text-center pb-2">النقاط</th>
                      <th className="text-center pb-2">المواظبة</th>
                      <th className="text-center pb-2">امتحانات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {full.top_students.slice(0, 8).map((st, i) => (
                      <tr key={st.id} className="hover:bg-amber-50/50 transition">
                        <td className="py-2.5 pr-1">
                          <span className={`inline-flex w-6 h-6 rounded-lg items-center justify-center text-[11px] font-black ${
                            i === 0 ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-stone-900'
                            : i === 1 ? 'bg-stone-300 text-stone-800'
                            : i === 2 ? 'bg-orange-300 text-stone-900'
                            : 'bg-stone-100 text-stone-400'}`}>{i + 1}</span>
                        </td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-200 to-indigo-200 text-indigo-900 flex items-center justify-center font-black text-[12px] shrink-0">
                              {st.name.trim().charAt(0)}
                            </div>
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
          </Panel>

          {/* Testimonials */}
          <Panel className="p-5 sm:p-6" id="reviews">
            <Head icon={MessageSquareQuote} tone="fuchsia">آراء الطلاب</Head>
            {full.testimonials.length === 0 ? (
              <Empty icon={MessageSquareQuote} title="لا تقييمات بعد"
                     hint="يظهر هنا رأي كل طالب بعد أن يقيّمك من فضائه الخاص." />
            ) : (
              <>
                <div className="flex flex-wrap gap-7 items-center pb-5 mb-5 border-b border-stone-100">
                  <div className="text-center">
                    <div className="text-[44px] font-black leading-none tabular-nums bg-gradient-to-br from-amber-500 to-orange-600 bg-clip-text text-transparent">
                      {Number(s.rating_avg).toFixed(1)}
                    </div>
                    <Stars value={s.rating_avg} size={15} />
                    <div className="text-[12px] text-stone-400 font-semibold mt-1">{s.rating_count} تقييم</div>
                  </div>
                  <div className="flex-1 min-w-[11rem] space-y-1.5">
                    {[5, 4, 3, 2, 1].map(star => {
                      const n   = full.rating_breakdown[String(star)] ?? 0
                      const pct = s.rating_count ? Math.round((n / s.rating_count) * 100) : 0
                      return (
                        <div key={star} className="flex items-center gap-2.5">
                          <span className="text-[11.5px] font-bold text-stone-400 w-3 tabular-nums">{star}</span>
                          <div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-l from-amber-400 to-orange-400" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[11.5px] font-bold text-stone-400 w-7 tabular-nums text-left">{n}</span>
                        </div>
                      )
                    })}
                  </div>
                  {s.attendance_rate != null && <Ring pct={s.attendance_rate} label="حضور" size={86} color="#7c3aed" />}
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {full.testimonials.map(t => (
                    <figure key={t.id} className="p-4 rounded-2xl bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 border border-violet-100">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <figcaption className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 text-white flex items-center justify-center font-black text-[12px]">
                            {(t.student_name ?? 'ط').trim().charAt(0)}
                          </div>
                          <span className="font-black text-[13px]">{t.student_name ?? 'طالب'}</span>
                        </figcaption>
                        <Stars value={t.rating} size={12} />
                      </div>
                      {t.comment && <blockquote className="text-[13.5px] text-stone-600 leading-relaxed">{t.comment}</blockquote>}
                    </figure>
                  ))}
                </div>
              </>
            )}
          </Panel>
        </div>

        {/* ── Sidebar ───────────────────────────────── */}
        <div className="space-y-4">

          <Panel className="p-5">
            <Head icon={BookOpen} tone="emerald">ماذا يُدرّس</Head>
            <div className="space-y-4">
              {p.levels.length > 0 && (
                <div>
                  <h4 className="text-[11.5px] font-black text-stone-400 mb-2">المستويات</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {p.levels.map(l => (
                      <span key={l} className="px-3 py-1.5 rounded-lg bg-gradient-to-br from-stone-800 to-stone-900 text-white text-[12px] font-black">{l}</span>
                    ))}
                  </div>
                </div>
              )}
              {p.teaches.length > 0 && (
                <div>
                  <h4 className="text-[11.5px] font-black text-emerald-700 mb-2 flex items-center gap-1.5"><ShieldCheck size={13} /> يُدرّس</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {p.teaches.map(t => (
                      <span key={t} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[12px] font-bold border border-emerald-200">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              {p.not_teaches.length > 0 && (
                <div>
                  <h4 className="text-[11.5px] font-black text-stone-400 mb-2 flex items-center gap-1.5"><XCircle size={13} /> لا يُدرّس</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {p.not_teaches.map(t => (
                      <span key={t} className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-400 text-[12px] font-bold line-through">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              {(p.age_min || p.age_max) && (
                <div className="pt-3 border-t border-stone-100">
                  <h4 className="text-[11.5px] font-black text-stone-400 mb-1">الفئة العمرية</h4>
                  <p className="text-[17px] font-black">{p.age_min ?? '—'} – {p.age_max ?? '—'} سنة</p>
                </div>
              )}
            </div>
          </Panel>

          <Panel className="p-5">
            <Head icon={Users} tone="violet">طلابي</Head>
            <Donut data={[
              { label: 'ذكور', value: full.gender_split.male },
              { label: 'إناث', value: full.gender_split.female },
              { label: 'غير محدد', value: full.gender_split.unknown },
            ]} size={116} />

            <div className="mt-5 pt-4 border-t border-stone-100">
              <h4 className="text-[11.5px] font-black text-stone-400 mb-2.5">
                الأعمار {full.avg_age && <span className="text-stone-500">· المتوسط {full.avg_age} سنة</span>}
              </h4>
              {full.age_bands.length > 0
                ? <HBars data={full.age_bands.map(b => ({ label: b.band, value: b.count }))} color="#7c3aed" />
                : <p className="py-4 text-center text-[12px] font-bold text-stone-300">أضف سنة ميلاد الطلاب في الـCRM.</p>}
            </div>

            {full.level_split.length > 0 && (
              <div className="mt-5 pt-4 border-t border-stone-100">
                <h4 className="text-[11.5px] font-black text-stone-400 mb-2.5">المستويات</h4>
                <HBars data={full.level_split.map(l => ({ label: l.level, value: l.count }))} color={VIZ.amber} />
              </div>
            )}
          </Panel>

          {p.liked_qualities.length > 0 && (
            <Panel className="p-5">
              <Head icon={Sparkles} tone="fuchsia">ما يحبه الطلاب</Head>
              <div className="flex flex-wrap gap-2">
                {p.liked_qualities.map((q, i) => (
                  <span key={q} className={`px-3 py-1.5 rounded-xl text-[12.5px] font-bold border ${CHIP[i % CHIP.length]}`}>{q}</span>
                ))}
              </div>
            </Panel>
          )}

          {p.certificates.length > 0 && (
            <Panel className="p-5">
              <Head icon={Award} tone="amber">الشهادات</Head>
              <div className="space-y-2.5">
                {p.certificates.map((c, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-l from-amber-50 to-white border border-amber-100">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shrink-0">
                      <Award size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-black text-[13px] leading-snug">{c.title}</div>
                      <div className="text-[11.5px] text-stone-500 font-semibold">{[c.issuer, c.year].filter(Boolean).join(' · ')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {p.experiences.length > 0 && (
            <Panel className="p-5">
              <Head icon={BookOpen} tone="blue">الخبرات</Head>
              <div className="relative pr-4">
                <div className="absolute right-1 top-2 bottom-2 w-px bg-gradient-to-b from-blue-400 via-blue-200 to-transparent" aria-hidden />
                <div className="space-y-4">
                  {p.experiences.map((e, i) => (
                    <div key={i} className="relative">
                      <span className="absolute -right-[13px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white" aria-hidden />
                      <div className="font-black text-[13px]">{e.role}</div>
                      <div className="text-[11.5px] text-stone-500 font-bold">
                        {[e.org, [e.from, e.to].filter(Boolean).join(' – ')].filter(Boolean).join(' · ')}
                      </div>
                      {e.description && <p className="text-[12px] text-stone-500 mt-1 leading-relaxed">{e.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          )}
        </div>
      </div>

      {editing && !demo && (
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

/* ── Local pieces ────────────────────────────────────── */

const CHIP = [
  'bg-violet-50 text-violet-800 border-violet-200',
  'bg-blue-50 text-blue-800 border-blue-200',
  'bg-emerald-50 text-emerald-800 border-emerald-200',
  'bg-amber-50 text-amber-800 border-amber-200',
  'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200',
]

const HEAD_TONE = {
  violet:  'bg-violet-100 text-violet-700',
  blue:    'bg-blue-100 text-blue-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  amber:   'bg-amber-100 text-amber-700',
  fuchsia: 'bg-fuchsia-100 text-fuchsia-700',
}

function Panel({ className = '', id, children }: { className?: string; id?: string; children: React.ReactNode }) {
  return (
    <section id={id} className={`bg-white rounded-3xl border border-stone-200/90 shadow-[0_1px_3px_rgba(28,25,23,.05)] ${className}`}>
      {children}
    </section>
  )
}

function Head({
  icon: Icon, tone, note, children,
}: { icon: typeof Users; tone: keyof typeof HEAD_TONE; note?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <h2 className="flex items-center gap-2.5 text-[16px] font-black tracking-tight">
        <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${HEAD_TONE[tone]}`}>
          <Icon size={16} />
        </span>
        {children}
      </h2>
      {note && <span className="text-[11px] font-bold text-stone-400 shrink-0">{note}</span>}
    </div>
  )
}

function Glass({
  icon: Icon, label, value, sub,
}: { icon: typeof Users; label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="rounded-2xl bg-white/12 backdrop-blur border border-white/15 px-3.5 py-3">
      <div className="flex items-center gap-1.5 text-white/60 mb-0.5">
        <Icon size={13} />
        <span className="text-[10.5px] font-bold truncate">{label}</span>
      </div>
      <div className="text-[22px] font-black leading-none tabular-nums">{value}</div>
      {sub && <div className="text-[10.5px] font-semibold text-white/50 mt-1 truncate">{sub}</div>}
    </div>
  )
}
