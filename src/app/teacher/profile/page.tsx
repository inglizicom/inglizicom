'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Camera, Loader2, Pencil, ExternalLink, Trophy, Sparkles, Users, Clock, CalendarCheck, Star,
  Award, Briefcase, BadgeCheck, Mail, Phone, CalendarDays, Languages, GraduationCap, Download,
  Heart, CheckCircle2, Circle, Video,
} from 'lucide-react'
import { useTeacher } from '@/lib/teacher-context'
import {
  fetchTeacherProfileFull, uploadTeacherAvatar,
  type TeacherProfileFull,
} from '@/lib/teachers'
import { HBars, Ring } from '../_charts'
import { Rise } from '../_ds'
import { isTeacherDemo } from '../_demo'
import { DemoBanner, Stars, fmtTime, STATUS_AR } from '../_ui'
import {
  Btn, Face, HelpBanner, SectionHead, ShareBtn, StatCard, StatusPill, Surface, profileChecklist,
} from '../_kit'
import ProfileEditor from './ProfileEditor'
import { DEMO_PROFILE } from './demoData'

/**
 * ملفي — the teacher's profile, laid out like a modern portal profile.
 *
 * An identity card (face, verified name, contact and facts, edit), five
 * numbers, then pairs of cards: what's coming and who I teach; credentials and
 * what I teach; how students rate me and what they said; my story and how
 * complete my public page is. It ends on the share banner — the public page is
 * only worth what it reaches.
 */

function ago(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 864e5)
  if (days <= 0) return 'اليوم'
  if (days < 30) return `قبل ${days} يوماً`
  const m = Math.round(days / 30)
  return m < 12 ? `قبل ${m} أشهر` : `قبل ${Math.round(m / 12)} سنة`
}

export default function TeacherProfilePage() {
  const teacher = useTeacher()
  const [full, setFull] = useState<TeacherProfileFull | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [demo, setDemo] = useState(false)
  const [busyAvatar, setBusyAvatar] = useState(false)

  async function load() {
    const isDemo = isTeacherDemo()
    setDemo(isDemo)
    if (isDemo) { setFull(DEMO_PROFILE); setLoading(false); return }
    const result = await fetchTeacherProfileFull(teacher.id)
    setFull(result)
    setLoading(false)
  }

  useEffect(() => { load() /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [teacher.id])

  // The dashboard's checklist links here with ?edit=1 — open the editor directly.
  useEffect(() => {
    if (!loading && full && !demo && new URLSearchParams(window.location.search).get('edit') === '1') setEditing(true)
  }, [loading, full, demo])

  if (loading) {
    return <div className="py-32 flex justify-center text-[#94A3B8]"><Loader2 size={20} className="animate-spin" /></div>
  }
  if (!full) {
    return <div className="p-10 text-center font-bold text-[#64748B]">تعذّر تحميل صفحتك.</div>
  }

  const p = full.profile
  const s = full.stats
  const name = p.display_name || full.identity.full_name || 'أستاذ'
  const publicHref = demo ? '/teacher-showcase/demo' : `/teacher-showcase/${teacher.id}`
  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}${publicHref}` : ''
  const check = profileChecklist(p)
  const edit = () => { if (!demo) setEditing(true) }

  async function onAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f || demo) return
    setBusyAvatar(true); await uploadTeacherAvatar(teacher.id, f); await load(); await teacher.refresh(); setBusyAvatar(false)
  }

  const joined = p.hired_at ? new Date(p.hired_at).toLocaleDateString('ar-MA', { month: 'long', year: 'numeric' }) : null
  const contact = [
    full.identity.email && { icon: Mail, text: full.identity.email, ltr: true },
    p.whatsapp && { icon: Phone, text: p.whatsapp, ltr: true },
    joined && { icon: CalendarDays, text: `انضم ${joined}` },
  ].filter(Boolean) as { icon: typeof Mail; text: string; ltr?: boolean }[]
  const facts = [
    p.years_experience != null && { icon: Briefcase, text: `${p.years_experience} سنوات خبرة` },
    (p.age_min || p.age_max) && { icon: Users, text: `أعمار ${p.age_min ?? '—'}–${p.age_max ?? '—'}` },
    p.languages?.length > 0 && { icon: Languages, text: p.languages.join(' · ') },
  ].filter(Boolean) as { icon: typeof Mail; text: string }[]

  const levelData = (full.level_split ?? []).map(l => ({ label: l.level, value: l.count }))
  const ageData   = (full.age_bands ?? []).map(b => ({ label: b.band, value: b.count }))
  const ratingTotal = Object.values(full.rating_breakdown ?? {}).reduce((a, b) => a + b, 0)
  const STAR_BAR = ['', 'bg-rose-500', 'bg-orange-500', 'bg-amber-400', 'bg-blue-500', 'bg-emerald-500']

  return (
    <div className="space-y-6">
      {demo && <DemoBanner />}

      {/* ══ Identity card ══ */}
      <Rise>
        <Surface className="p-5 sm:p-7">
          <div className="flex flex-col sm:flex-row gap-5 sm:gap-7">
            <div className="relative shrink-0 self-center sm:self-start">
              {p.avatar_url
                ? /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={p.avatar_url} alt={name} className="h-[124px] w-[124px] rounded-full object-cover ring-4 ring-blue-50 shadow-lg" />
                : <div className="h-[124px] w-[124px] rounded-full ring-4 ring-blue-50 shadow-lg bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center text-[44px] font-black">
                    {name.trim().charAt(0)}
                  </div>}
              <label className="absolute bottom-1 left-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white ring-1 ring-[#E2E8F0] shadow-md transition hover:bg-blue-50" aria-label="تغيير الصورة">
                {busyAvatar ? <Loader2 size={15} className="animate-spin text-[#64748B]" /> : <Camera size={15} className="text-blue-700" />}
                <input type="file" accept="image/*" hidden onChange={onAvatar} disabled={demo} />
              </label>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-[26px] sm:text-[30px] font-extrabold tracking-tight text-[#1E3A8A]">{name}</h1>
                    <BadgeCheck size={22} className="text-blue-600" aria-label="أستاذ موثّق" />
                    {s.is_top_rated && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-l from-amber-400 to-yellow-500 px-2.5 py-1 text-[11px] font-extrabold text-blue-900">
                        <Trophy size={11} /> من الأفضل تقييماً
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[14px] font-semibold text-[#475569]">{p.headline || p.tagline || 'أضف عنواناً مهنياً يظهر للطلاب.'}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Btn icon={Pencil} kind="ghost" onClick={edit} disabled={demo}>تعديل الملف</Btn>
                  <Btn href={publicHref} icon={ExternalLink}>الملف العام</Btn>
                </div>
              </div>

              {contact.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-[#475569]">
                  {contact.map(c => (
                    <span key={c.text} className="inline-flex items-center gap-1.5">
                      <c.icon size={15} className="text-blue-600" />
                      <span dir={c.ltr ? 'ltr' : undefined}>{c.text}</span>
                    </span>
                  ))}
                </div>
              )}
              {facts.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {facts.map(f => (
                    <span key={f.text} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-[12.5px] font-bold text-blue-800">
                      <f.icon size={14} className="text-blue-600" /> {f.text}
                    </span>
                  ))}
                  {p.levels?.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-[12.5px] font-bold text-amber-800" dir="ltr">
                      {p.levels.join(' · ')}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </Surface>
      </Rise>

      {/* ══ Five numbers ══ */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <Rise i={0}><StatCard icon={Users} tone="stone" label="طلاب نشطون" value={s.students_active}
          sub={`${s.students_total} منذ البداية`} href="/teacher/students" link="عرض الطلاب" /></Rise>
        <Rise i={1}><StatCard icon={CalendarCheck} tone="emerald" label="حصص منجزة" value={s.classes_done}
          sub={s.attendance_rate != null ? `حضور ${Math.round(Number(s.attendance_rate))}%` : 'كل الحصص'} href="/teacher/classes" link="عرض الحصص" /></Rise>
        <Rise i={2}><StatCard icon={Clock} tone="violet" label="ساعات تدريس" value={Number(s.hours_total)}
          sub="مجموع الساعات" href="/teacher/earnings" link="الأرباح" /></Rise>
        <Rise i={3}><StatCard icon={Star} tone="gold" label="التقييم"
          value={s.rating_count > 0 ? Number(s.rating_avg).toFixed(1) : '—'}
          sub={s.rating_count > 0 ? `${s.rating_count} تقييماً` : 'لا تقييمات بعد'} href="/teacher/reviews" link="التقييمات" /></Rise>
        <Rise i={4} className="col-span-2 lg:col-span-1"><StatCard icon={GraduationCap} tone="rose" label="المستوى في الإنجليزية"
          value={p.english_level || '—'} sub={p.english_level ? 'مستوى موثّق' : 'أضفه من التعديل'} /></Rise>
      </div>

      {/* ══ Upcoming + who I teach ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Rise className="lg:col-span-7">
          <Surface className="p-5 sm:p-6 h-full">
            <SectionHead title="حصصي القادمة" href="/teacher/classes" link="كل الحصص" />
            {full.upcoming.length === 0 ? (
              <p className="py-8 text-center text-[13px] text-[#94A3B8]">لا حصص قادمة.</p>
            ) : (
              <ul className="space-y-3">
                {full.upcoming.slice(0, 3).map(u => (
                  <li key={u.id}>
                    <Link href={`/teacher/classes/${u.id}`}
                          className="flex items-center gap-4 rounded-2xl ring-1 ring-[#E2E8F0] p-3 hover:ring-blue-300 hover:shadow-md transition">
                      <span className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 text-white shadow-md
                                        ${u.mode === 'private' ? 'bg-gradient-to-br from-amber-400 to-yellow-500 !text-blue-900' : 'bg-gradient-to-br from-blue-500 to-blue-700'}`}>
                        <Video size={22} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[14px] font-extrabold text-[#1E3A8A] truncate">{u.title}</div>
                        <div className="text-[12px] text-[#64748B]">{STATUS_AR[u.mode]}{u.level ? ` · ${u.level}` : ''} · {u.duration_min} د</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 text-left">
                        <CalendarDays size={16} className="text-blue-600" />
                        <div className="leading-tight">
                          <div className="text-[11px] text-[#94A3B8]">الحصة</div>
                          <div className="text-[12.5px] font-bold text-[#334155]">
                            {new Date(u.starts_at).toLocaleDateString('ar-MA', { day: 'numeric', month: 'short' })} · {fmtTime(u.starts_at)}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Surface>
        </Rise>

        <Rise className="lg:col-span-5">
          <Surface className="p-5 sm:p-6 h-full">
            <SectionHead title="من أُدرّسهم" />
            {levelData.length === 0 && ageData.length === 0 ? (
              <p className="py-8 text-center text-[13px] text-[#94A3B8]">يظهر هنا توزيع طلابك حسب المستوى والعمر.</p>
            ) : (
              <div className="space-y-5">
                {levelData.length > 0 && (
                  <div>
                    <div className="mb-2.5 text-[12px] font-bold text-[#64748B]">حسب المستوى</div>
                    <HBars data={levelData} color="#2563EB" />
                  </div>
                )}
                {ageData.length > 0 && (
                  <div>
                    <div className="mb-2.5 text-[12px] font-bold text-[#64748B]">حسب العمر{full.avg_age != null ? ` · المتوسط ${full.avg_age} سنة` : ''}</div>
                    <HBars data={ageData} color="#F59E0B" />
                  </div>
                )}
              </div>
            )}
          </Surface>
        </Rise>
      </div>

      {/* ══ Credentials + what I teach ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Rise>
          <Surface className="p-5 sm:p-6 h-full">
            <SectionHead title="شهاداتي" action={!demo && <button onClick={edit} className="text-[12.5px] font-bold text-blue-700 hover:text-blue-900">إضافة / تعديل</button>} />
            {p.certificates?.length ? (
              <ul className="space-y-3">
                {p.certificates.map((c, i) => (
                  <li key={i} className="flex items-center gap-3 rounded-2xl ring-1 ring-[#E2E8F0] p-3">
                    <span className="w-12 h-14 rounded-lg bg-gradient-to-b from-amber-50 to-amber-100 ring-1 ring-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                      <Award size={20} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13.5px] font-extrabold text-[#1E3A8A] truncate">{c.title}</div>
                      <div className="text-[12px] text-[#64748B]">{[c.issuer, c.year].filter(Boolean).join(' · ') || '—'}</div>
                    </div>
                    <StatusPill tone="ok">موثّقة</StatusPill>
                    {c.url && (
                      <a href={c.url} target="_blank" rel="noopener noreferrer" aria-label="فتح الشهادة"
                         className="w-8 h-8 rounded-lg ring-1 ring-[#E2E8F0] flex items-center justify-center text-blue-700 hover:bg-blue-50">
                        <Download size={15} />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-8 text-center text-[13px] text-[#94A3B8]">أضف شهاداتك — هي أول ما يثق به الطالب.</p>
            )}
          </Surface>
        </Rise>

        <Rise i={1}>
          <Surface className="p-5 sm:p-6 h-full">
            <SectionHead title="ما أُدرّسه" action={!demo && <button onClick={edit} className="text-[12.5px] font-bold text-blue-700 hover:text-blue-900">تعديل</button>} />
            {[p.specialties, p.teaches, p.competences].every(a => !a?.length) ? (
              <p className="py-8 text-center text-[13px] text-[#94A3B8]">حدّد تخصصاتك ليعرف الطلاب إن كنت الأستاذ المناسب لهم.</p>
            ) : (
              <div className="space-y-4">
                {[
                  { label: 'التخصصات', items: p.specialties, cls: 'bg-blue-50 text-blue-700 ring-1 ring-blue-100' },
                  { label: 'أُدرّس', items: p.teaches, cls: 'bg-white text-[#334155] ring-1 ring-[#E2E8F0]' },
                  { label: 'نقاط قوتي', items: p.competences, cls: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200' },
                  { label: 'لا أُدرّس', items: p.not_teaches, cls: 'bg-slate-50 text-slate-400 line-through ring-1 ring-slate-200' },
                ].filter(g => g.items?.length).map(g => (
                  <div key={g.label}>
                    <div className="mb-2 text-[12px] font-bold text-[#64748B]">{g.label}</div>
                    <div className="flex flex-wrap gap-2">
                      {g.items.map(t => <span key={t} className={`rounded-lg px-3 py-1.5 text-[12.5px] font-bold ${g.cls}`}>{t}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Surface>
        </Rise>
      </div>

      {/* ══ Ratings + what students said ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Rise>
          <Surface className="p-5 sm:p-6 h-full">
            <SectionHead title="تقييمات الطلاب" href="/teacher/reviews" link="التفاصيل" />
            {s.rating_count === 0 ? (
              <p className="py-8 text-center text-[13px] text-[#94A3B8]">لا تقييمات بعد — يقيّمك الطلاب من فضائهم.</p>
            ) : (
              <>
                <div className="flex items-baseline gap-3">
                  <span className="text-[40px] font-extrabold leading-none text-[#1E3A8A] tabular-nums">{Number(s.rating_avg).toFixed(1)}</span>
                  <div><Stars value={Number(s.rating_avg)} size={15} />
                    <div className="text-[12px] font-semibold text-[#64748B] mt-0.5">من {s.rating_count} تقييماً · استمر هكذا!</div></div>
                </div>
                <div className="mt-5 space-y-3">
                  {[5, 4, 3, 2, 1].map(n => {
                    const c = full.rating_breakdown?.[String(n)] ?? 0
                    const pct = ratingTotal ? Math.round((c / ratingTotal) * 100) : 0
                    return (
                      <div key={n} className="flex items-center gap-3 text-[12.5px]">
                        <span className="w-14 inline-flex items-center gap-1 font-bold text-[#334155]">{n} <Star size={12} className="text-amber-400" fill="currentColor" /></span>
                        <div className="flex-1 h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                          <div className={`h-full rounded-full ${STAR_BAR[n]}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-10 text-left font-bold text-[#475569] tabular-nums">{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </Surface>
        </Rise>

        <Rise i={1}>
          <Surface className="p-5 sm:p-6 h-full">
            <SectionHead title="ما قاله طلابي" href="/teacher/reviews" link="الكل" />
            {full.testimonials?.length ? (
              <ul className="space-y-2.5">
                {full.testimonials.slice(0, 4).map(t => (
                  <li key={t.id} className="flex gap-3 rounded-2xl bg-[#F8FAFC] ring-1 ring-[#E2E8F0] p-3">
                    <Face name={t.student_name ?? 'طالب'} url={t.student_avatar} size={36} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-extrabold text-[#1E3A8A] truncate">{t.student_name ?? 'طالب'}</span>
                        <span className="text-[11px] text-[#94A3B8] shrink-0">{ago(t.created_at)}</span>
                      </div>
                      <Stars value={t.rating} size={11} />
                      <p className={`mt-1 text-[12.5px] leading-relaxed line-clamp-2 ${t.comment ? 'text-[#475569]' : 'text-[#94A3B8] italic'}`}>
                        {t.comment || 'قيّم دون تعليق.'}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-8 text-center text-[13px] text-[#94A3B8]">ستظهر هنا آراء طلابك.</p>
            )}
          </Surface>
        </Rise>
      </div>

      {/* ══ My story + completeness ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Rise className="lg:col-span-7">
          <Surface className="p-5 sm:p-6 h-full">
            <SectionHead title="نبذة عني" action={!demo && <button onClick={edit} className="text-[12.5px] font-bold text-blue-700 hover:text-blue-900">تعديل</button>} />
            <p className={`text-[14px] leading-[1.9] whitespace-pre-wrap ${p.bio ? 'text-[#334155]' : 'text-[#94A3B8]'}`}>
              {p.bio || 'اكتب نبذة قصيرة: كيف تُدرّس، ولمن، وما الذي يحققه الطالب معك.'}
            </p>
            {p.experiences?.length > 0 && (
              <ol className="mt-5 relative space-y-4 before:absolute before:right-[7px] before:top-1.5 before:bottom-1.5 before:w-px before:bg-[#E2E8F0]">
                {p.experiences.map((x, i) => (
                  <li key={i} className="relative pr-6">
                    <span className={`absolute right-0 top-1 w-[15px] h-[15px] rounded-full ring-4 ring-white ${i === 0 ? 'bg-blue-600' : 'bg-blue-200'}`} />
                    <div className="flex flex-wrap items-center gap-x-2">
                      <span className="text-[13.5px] font-extrabold text-[#1E3A8A]">{x.role}</span>
                      {x.org && <span className="text-[12.5px] text-[#64748B]">· {x.org}</span>}
                      {(x.from || x.to) && <StatusPill tone={i === 0 ? 'info' : 'muted'}>{[x.from, x.to].filter(Boolean).join('–')}</StatusPill>}
                    </div>
                  </li>
                ))}
              </ol>
            )}
            {p.liked_qualities?.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {p.liked_qualities.map(q => (
                  <span key={q} className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1.5 text-[12px] font-bold text-rose-700">
                    <Heart size={11} /> {q}
                  </span>
                ))}
              </div>
            )}
          </Surface>
        </Rise>

        <Rise className="lg:col-span-5">
          <Surface className="p-5 sm:p-6 h-full">
            <SectionHead title="اكتمال الملف العام" />
            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center gap-5">
              <Ring pct={check.pct} size={140} color="#16A34A" label="مكتمل" />
              <ul className="flex-1 w-full space-y-1.5">
                {check.items.map(c => (
                  <li key={c.label}>
                    <button onClick={() => !c.done && edit()}
                            className={`w-full text-right flex items-center gap-2 text-[12.5px] font-semibold
                                        ${c.done ? 'text-[#94A3B8] cursor-default' : 'text-[#334155] hover:text-blue-700'}`}>
                      {c.done ? <CheckCircle2 size={15} className="text-emerald-600 shrink-0" /> : <Circle size={15} className="text-[#CBD5E1] shrink-0" />}
                      <span className={c.done ? 'line-through decoration-[#CBD5E1]' : ''}>{c.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </Surface>
        </Rise>
      </div>

      {/* ══ Share banner ══ */}
      <Rise>
        <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-l from-blue-600 via-blue-700 to-blue-900 px-6 py-6 sm:px-8 text-white">
          <div aria-hidden className="pointer-events-none absolute -top-20 left-1/4 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(251,191,36,.25),transparent_65%)]" />
          <div className="relative flex flex-col sm:flex-row items-center gap-5 text-center sm:text-right">
            <span className="w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-blue-900 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Sparkles size={24} />
            </span>
            <div className="flex-1 min-w-0">
              <h2 className="text-[19px] font-extrabold text-white">شارك ملفك العام</h2>
              <p className="mt-1 text-[13px] text-blue-100">ضع الرابط في واتساب، إنستغرام أو توقيع بريدك — كل مشاركة قد تعني طالباً جديداً.</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <ShareBtn url={publicUrl} title={name} kind="gold" label="مشاركة الملف" />
              <Btn href={publicHref} icon={ExternalLink} kind="glass">معاينة</Btn>
            </div>
          </div>
        </section>
      </Rise>

      <HelpBanner title="تحتاج مساعدة في ملفك؟" text="فريق إنجليزي.كوم يساعدك على كتابة نبذة قوية واختيار ما تعرضه للطلاب." />

      {editing && (
        <ProfileEditor
          teacherId={teacher.id}
          profile={full.profile}
          onClose={() => setEditing(false)}
          onSaved={async () => { setEditing(false); await load(); await teacher.refresh() }}
        />
      )}
    </div>
  )
}
