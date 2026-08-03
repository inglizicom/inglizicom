'use client'

import { useEffect, useState } from 'react'
import {
  Award, BookOpen, Camera, CalendarClock, Flame, GraduationCap, Image as ImageIcon,
  Loader2, MessageSquareQuote, Pencil, Printer, ShieldCheck, Star, Trophy,
  Users, Video, XCircle, FlaskConical, Quote,
} from 'lucide-react'
import { useTeacher } from '@/lib/teacher-context'
import {
  fetchTeacherProfileFull, uploadTeacherAvatar, uploadTeacherCover,
  type TeacherProfileFull,
} from '@/lib/teachers'
import { Donut, HBars, Ring } from '../_charts'
import { Reveal } from '../_motion'
import { Stars, fmtTime } from '../_ui'
import ProfileEditor from './ProfileEditor'
import { DEMO_PROFILE } from './demoData'

/**
 * The tutor page, laid out as a CV rather than a dashboard — because that is
 * what it is: one person's record, meant to be read top to bottom and judged.
 *
 * A résumé earns trust through restraint, so the chrome recedes: one ink, one
 * brass accent, hairline rules instead of cards, and generous white. The
 * charts stay but are sized as marginalia, not centrepieces. It prints.
 *
 * Editing controls are deliberately quiet and vanish in print and in `?demo=1`.
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
    return <div className="p-10 text-center font-black text-stone-600">تعذّر تحميل الملف الشخصي.</div>
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
    <div className="max-w-5xl mx-auto">
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          .cv-sheet { box-shadow: none !important; border: 0 !important; margin: 0 !important; }
          body { background: #fff !important; }
        }
      `}</style>

      {demo && (
        <div className="no-print flex items-center gap-2.5 rounded-xl bg-fuchsia-50 border border-fuchsia-200 px-4 py-2.5 mb-4">
          <FlaskConical size={15} className="text-fuchsia-600 shrink-0" />
          <span className="text-[12.5px] font-bold text-fuchsia-900">معاينة ببيانات وهمية — لا شيء هنا حقيقي.</span>
        </div>
      )}

      {/* Controls sit outside the sheet, like the frame around a document */}
      <div className="no-print flex flex-wrap items-center justify-end gap-2 mb-3">
        <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white ring-1 ring-stone-900/10 text-stone-600 text-[12.5px] font-bold cursor-pointer hover:bg-stone-50 transition">
          {busyCover ? <Loader2 size={13} className="animate-spin" /> : <ImageIcon size={13} />}
          الغلاف
          <input type="file" accept="image/*" hidden onChange={onCover} disabled={demo} />
        </label>
        <button onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white ring-1 ring-stone-900/10 text-stone-600 text-[12.5px] font-bold hover:bg-stone-50 transition">
          <Printer size={13} /> طباعة / PDF
        </button>
        <button onClick={() => !demo && setEditing(true)} disabled={demo}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-stone-900 text-white text-[12.5px] font-black hover:bg-stone-700 transition disabled:opacity-50">
          <Pencil size={13} /> تعديل الملف
        </button>
      </div>

      {/* ═══ The sheet ═══════════════════════════════════ */}
      <article className="cv-sheet bg-white rounded-2xl ring-1 ring-stone-900/[.07] shadow-[0_1px_3px_rgba(24,24,27,.05),0_24px_60px_-32px_rgba(24,24,27,.45)] overflow-hidden">

        {/* Cover strip — a band of colour, not a hero */}
        <div className="relative h-24 sm:h-28 bg-gradient-to-l from-stone-900 via-stone-800 to-amber-900">
          {p.cover_url && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={p.cover_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-70" />
          )}
        </div>

        {/* ── Masthead ─────────────────────────────── */}
        {/* Only the portrait overlaps the cover strip. Pulling the whole header
            up put the name — dark ink — on top of the dark band, invisible. */}
        <header className="px-6 sm:px-9 pb-7 pt-4 border-b border-stone-200">
          <div className="flex flex-wrap items-end gap-5">
            <div className="relative shrink-0 -mt-16">
              {p.avatar_url
                ? /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={p.avatar_url} alt="" className="w-28 h-28 rounded-xl object-cover ring-4 ring-white shadow-lg" />
                : <div className="w-28 h-28 rounded-xl bg-stone-900 text-amber-400 ring-4 ring-white shadow-lg flex items-center justify-center text-5xl font-black">
                    {name.trim().charAt(0)}
                  </div>}
              <label className="no-print absolute -bottom-2 -left-2 w-8 h-8 rounded-full bg-white ring-1 ring-stone-900/10 text-stone-600 flex items-center justify-center shadow cursor-pointer hover:bg-stone-50 transition">
                {busyAvatar ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
                <input type="file" accept="image/*" hidden onChange={onAvatar} disabled={demo} />
              </label>
            </div>

            <div className="flex-1 min-w-[14rem] pb-1">
              <h1 className="font-display text-[34px] sm:text-[42px] font-black tracking-tight leading-none text-stone-900">
                {name}
              </h1>
              <p className="text-[15px] font-bold text-amber-800 mt-2 leading-snug">
                {p.tagline || p.headline || 'أضف جملة تصف ما تُتقنه أكثر'}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-[12.5px] font-semibold text-stone-500">
                {p.english_level    && <span>الإنجليزية · {p.english_level}</span>}
                {p.years_experience != null && <span>{p.years_experience} سنوات خبرة</span>}
                {p.languages.length > 0 && <span>{p.languages.join(' · ')}</span>}
                {(p.age_min || p.age_max) && <span>يُدرّس {p.age_min ?? '—'}–{p.age_max ?? '—'} سنة</span>}
              </div>
            </div>

            <div className="pb-1 text-left">
              {s.rating_count > 0 ? (
                <>
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="text-[26px] font-black tabular-nums leading-none">{Number(s.rating_avg).toFixed(1)}</span>
                    <Stars value={s.rating_avg} size={14} />
                  </div>
                  <div className="text-[11.5px] font-bold text-stone-400 mt-1">{s.rating_count} تقييم من الطلاب</div>
                </>
              ) : (
                <div className="text-[11.5px] font-bold text-stone-300">لا تقييمات بعد</div>
              )}
              {s.is_top_rated && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 text-[11px] font-black">
                  <Trophy size={11} /> أستاذ متميّز
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Figures band ─────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 divide-x divide-x-reverse divide-stone-200 border-b border-stone-200">
          {[
            { label: 'طالباً',        value: s.students_total },
            { label: 'حصة أُنجزت',    value: s.classes_done },
            { label: 'ساعة تدريس',    value: s.hours_total },
            { label: 'امتحاناً',      value: s.exams_corrected },
            { label: 'نسبة الحضور',   value: s.attendance_rate != null ? `${s.attendance_rate}%` : '—' },
          ].map(f => (
            <div key={f.label} className="px-4 py-4 text-center">
              <div className="text-[24px] font-black tabular-nums leading-none text-stone-900">{f.value}</div>
              <div className="text-[10.5px] font-bold text-stone-400 mt-1.5">{f.label}</div>
            </div>
          ))}
        </div>

        {/* ── Body ─────────────────────────────────── */}
        <div className="grid md:grid-cols-[1fr_18rem] divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-stone-200">

          {/* Main column */}
          <div className="min-w-0 px-6 sm:px-9 py-7 space-y-8">

            <Section title="نبذة مهنية">
              <p className="text-[14.5px] leading-[2] text-stone-600 whitespace-pre-wrap">
                {p.bio || 'لا نبذة بعد.'}
              </p>
            </Section>

            {p.experiences.length > 0 && (
              <Section title="الخبرة المهنية">
                <ol className="space-y-5">
                  {p.experiences.map((e, i) => (
                    <li key={i} className="grid grid-cols-[5.5rem_1fr] gap-4">
                      <span className="text-[12px] font-black text-amber-800 pt-0.5 tabular-nums">
                        {[e.from, e.to].filter(Boolean).join(' – ') || '—'}
                      </span>
                      <div className="border-r-2 border-stone-200 pr-4">
                        <h4 className="font-black text-[14.5px] text-stone-900">{e.role}</h4>
                        {e.org && <div className="text-[12.5px] font-bold text-stone-500">{e.org}</div>}
                        {e.description && <p className="text-[13px] text-stone-500 leading-relaxed mt-1">{e.description}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              </Section>
            )}

            <Section title="ما يُدرّسه">
              <div className="space-y-3.5">
                {p.levels.length > 0 && (
                  <Line label="المستويات">
                    {p.levels.map(l => (
                      <span key={l} className="px-2.5 py-1 rounded bg-stone-900 text-white text-[11.5px] font-black">{l}</span>
                    ))}
                  </Line>
                )}
                {p.teaches.length > 0 && (
                  <Line label="التخصصات" icon={<ShieldCheck size={12} className="text-emerald-600" />}>
                    {p.teaches.map(t => (
                      <span key={t} className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 text-[12px] font-bold ring-1 ring-emerald-200">{t}</span>
                    ))}
                  </Line>
                )}
                {p.not_teaches.length > 0 && (
                  <Line label="لا يُدرّس" icon={<XCircle size={12} className="text-stone-400" />}>
                    {p.not_teaches.map(t => (
                      <span key={t} className="px-2.5 py-1 rounded bg-stone-100 text-stone-500 text-[12px] font-bold line-through">{t}</span>
                    ))}
                  </Line>
                )}
              </div>
            </Section>

            {p.competences.length > 0 && (
              <Section title="المهارات">
                <div className="flex flex-wrap gap-2">
                  {p.competences.map(c => (
                    <span key={c} className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-900 text-[12.5px] font-bold ring-1 ring-amber-200/70">{c}</span>
                  ))}
                </div>
              </Section>
            )}

            {full.top_students.length > 0 && (
              <Section title="أبرز الطلاب" note="النقاط · المواظبة · الامتحانات">
                <div className="overflow-x-auto -mx-1 px-1">
                  <table className="w-full text-sm min-w-[26rem]">
                    <tbody className="divide-y divide-stone-100">
                      {full.top_students.slice(0, 6).map((st, i) => (
                        <tr key={st.id}>
                          <td className="py-2.5 w-8 text-[12px] font-black text-stone-300 tabular-nums">{i + 1}</td>
                          <td className="py-2.5">
                            <span className="font-bold text-[13.5px] text-stone-800">{st.name}</span>
                            {st.level && <span className="text-[11.5px] font-bold text-stone-400 mr-2">{st.level}</span>}
                          </td>
                          <td className="py-2.5 text-center text-[12.5px] font-black text-amber-700 tabular-nums w-16">{st.coins}</td>
                          <td className="py-2.5 text-center w-16">
                            <span className="inline-flex items-center gap-1 text-[12.5px] font-black text-orange-600 tabular-nums">
                              <Flame size={11} /> {st.streak}
                            </span>
                          </td>
                          <td className="py-2.5 text-center text-[12.5px] font-black text-emerald-700 tabular-nums w-14">{st.exams_passed}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
            )}

            {full.testimonials.length > 0 && (
              <Section title="آراء الطلاب">
                <div className="space-y-4">
                  {full.testimonials.slice(0, 4).map(t => (
                    <Reveal key={t.id}>
                      <figure className="border-r-2 border-amber-300 pr-4">
                        <Quote size={14} className="text-amber-400 mb-1" />
                        {t.comment && <blockquote className="text-[13.5px] text-stone-600 leading-relaxed">{t.comment}</blockquote>}
                        <figcaption className="flex items-center gap-2 mt-2 text-[12px] font-bold text-stone-400">
                          {t.student_name ?? 'طالب'} <Stars value={t.rating} size={11} />
                        </figcaption>
                      </figure>
                    </Reveal>
                  ))}
                </div>
              </Section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="min-w-0 px-6 sm:px-7 py-7 space-y-7 bg-stone-50/60">

            {full.upcoming.length > 0 && (
              <Aside title="جدول الأسبوع" icon={CalendarClock}>
                <ul className="space-y-2.5">
                  {full.upcoming.slice(0, 5).map(u => (
                    <li key={u.id} className="flex gap-2.5">
                      <span className="shrink-0 w-11 text-center">
                        <span className="block text-[10px] font-bold text-stone-400">
                          {new Date(u.starts_at).toLocaleDateString('ar-MA', { weekday: 'short' })}
                        </span>
                        <span className="block text-[13px] font-black tabular-nums text-stone-800">{fmtTime(u.starts_at)}</span>
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[12.5px] font-bold text-stone-700 leading-snug">{u.title}</span>
                        <span className="block text-[10.5px] font-semibold text-stone-400">{u.duration_min} دقيقة{u.level ? ` · ${u.level}` : ''}</span>
                      </span>
                      {u.meeting_url && (
                        <a href={u.meeting_url} target="_blank" rel="noopener noreferrer"
                           className="no-print mr-auto self-center text-stone-400 hover:text-stone-800" aria-label="دخول">
                          <Video size={13} />
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </Aside>
            )}

            {p.certificates.length > 0 && (
              <Aside title="الشهادات" icon={Award}>
                <ul className="space-y-3">
                  {p.certificates.map((c, i) => (
                    <li key={i}>
                      <div className="text-[12.5px] font-black text-stone-800 leading-snug">{c.title}</div>
                      <div className="text-[11px] font-semibold text-stone-400">{[c.issuer, c.year].filter(Boolean).join(' · ')}</div>
                    </li>
                  ))}
                </ul>
              </Aside>
            )}

            {p.liked_qualities.length > 0 && (
              <Aside title="ما يحبه الطلاب" icon={Star}>
                <div className="flex flex-wrap gap-1.5">
                  {p.liked_qualities.map(q => (
                    <span key={q} className="px-2.5 py-1 rounded bg-white ring-1 ring-stone-200 text-[11.5px] font-bold text-stone-600">{q}</span>
                  ))}
                </div>
              </Aside>
            )}

            {s.rating_count > 0 && (
              <Aside title="توزيع التقييم" icon={MessageSquareQuote}>
                <div className="space-y-1.5">
                  {[5, 4, 3, 2, 1].map(star => {
                    const n = full.rating_breakdown[String(star)] ?? 0
                    const pct = s.rating_count ? Math.round((n / s.rating_count) * 100) : 0
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-[10.5px] font-bold text-stone-400 w-2.5 tabular-nums">{star}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-stone-200 overflow-hidden">
                          <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[10.5px] font-bold text-stone-400 w-5 tabular-nums text-left">{n}</span>
                      </div>
                    )
                  })}
                </div>
              </Aside>
            )}

            <Aside title="طلابي" icon={Users}>
              <Donut size={96} data={[
                { label: 'ذكور', value: full.gender_split.male },
                { label: 'إناث', value: full.gender_split.female },
                { label: 'غير محدد', value: full.gender_split.unknown },
              ]} />
              {full.age_bands.length > 0 && (
                <div className="mt-4">
                  <div className="text-[10.5px] font-black text-stone-400 mb-2">
                    الأعمار{full.avg_age ? ` · المتوسط ${full.avg_age}` : ''}
                  </div>
                  <HBars data={full.age_bands.map(b => ({ label: b.band, value: b.count }))} color="#b45309" />
                </div>
              )}
              {full.level_split.length > 0 && (
                <div className="mt-4">
                  <div className="text-[10.5px] font-black text-stone-400 mb-2">المستويات</div>
                  <HBars data={full.level_split.map(l => ({ label: l.level, value: l.count }))} color="#78716c" />
                </div>
              )}
            </Aside>

            {s.attendance_rate != null && (
              <Aside title="الانضباط" icon={GraduationCap}>
                <div className="flex items-center gap-4">
                  <Ring pct={s.attendance_rate} size={78} color="#b45309" label="حضور" />
                  <div className="text-[11.5px] font-semibold text-stone-500 leading-relaxed">
                    {s.reports_written} تقرير درس مكتوب<br />{full.upcoming.length} حصة قادمة
                  </div>
                </div>
              </Aside>
            )}
          </aside>
        </div>
      </article>

      <p className="no-print text-center text-[11.5px] font-semibold text-stone-400 mt-4">
        هذه الصفحة خاصة بالإدارة والأستاذ. عند نشرها للعموم لاحقاً ستُخفى الأرقام الداخلية.
      </p>

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

/* ── CV primitives ───────────────────────────────────── */

/** A section title in a CV is a rule with a label, not a card header. */
function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <Reveal>
      <section>
        <div className="flex items-baseline justify-between gap-3 mb-3.5">
          <h3 className="text-[12px] font-black text-stone-900 tracking-[0.18em] uppercase">{title}</h3>
          {note && <span className="text-[10.5px] font-bold text-stone-400">{note}</span>}
          <span className="flex-1 h-px bg-stone-200" aria-hidden />
        </div>
        {children}
      </section>
    </Reveal>
  )
}

function Aside({ title, icon: Icon, children }: { title: string; icon: typeof Users; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="flex items-center gap-1.5 text-[11px] font-black text-stone-900 tracking-[0.15em] uppercase mb-3">
        <Icon size={13} className="text-amber-700" /> {title}
      </h3>
      {children}
    </section>
  )
}

function Line({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-1 text-[11.5px] font-black text-stone-400 w-20 shrink-0">
        {icon} {label}
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}
