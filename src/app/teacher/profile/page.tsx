'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Camera, Loader2, Pencil, ExternalLink, Quote, Trophy, Sparkles,
  Users, Clock, CalendarCheck, Star, GraduationCap, Award, Briefcase, PieChart, ListChecks,
  CheckCircle2, Circle, Languages, BadgeCheck, Heart,
} from 'lucide-react'
import { useTeacher } from '@/lib/teacher-context'
import {
  fetchTeacherProfileFull, uploadTeacherAvatar,
  type TeacherProfileFull,
} from '@/lib/teachers'
import { Donut, HBars } from '../_charts'
import { Rise } from '../_ds'
import { isTeacherDemo } from '../_demo'
import { DemoBanner, Stars } from '../_ui'
import {
  Btn, CardHead, CopyBtn, Face, Kpi, ShareBtn, Surface, profileChecklist, publicProfileUrl,
} from '../_kit'
import ProfileEditor from './ProfileEditor'
import { DEMO_PROFILE } from './demoData'

/**
 * ملفي العام — the teacher's personal brand, managed.
 *
 * Not a CV. The top of the page is the identity a visitor meets (face,
 * promise, rating) with the actions that put it in front of people: share,
 * preview, edit. Below it, what a student actually decides on — what I teach,
 * the numbers behind me, what others said — as short cards rather than
 * paragraphs. Credentials are badges, not a career timeline. The side column
 * tracks how complete the page is, because an incomplete page converts worse.
 */

function ChipRow({ label, items, tone = 'plain' }: {
  label: string; items: string[] | undefined; tone?: 'plain' | 'gold' | 'muted'
}) {
  if (!items?.length) return null
  const cls = {
    plain: 'bg-white ring-1 ring-[#E2E8F0] text-[#334155]',
    gold:  'bg-[#FEF3C7] text-[#B45309]',
    muted: 'bg-[#EEF2F7] text-[#94A3B8] line-through decoration-[#CBD5E1]',
  }[tone]
  return (
    <div>
      <div className="text-[11px] font-bold tracking-[.1em] text-[#94A3B8] mb-2">{label}</div>
      <div className="flex flex-wrap gap-2">
        {items.map(t => (
          <span key={t} className={`rounded-full px-3 py-1.5 text-[12.5px] font-bold ${cls}`}>{t}</span>
        ))}
      </div>
    </div>
  )
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
    return <div className="py-32 flex justify-center text-[#CBD5E1]"><Loader2 size={20} className="animate-spin" /></div>
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

  async function onAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f || demo) return
    setBusyAvatar(true); await uploadTeacherAvatar(teacher.id, f); await load(); await teacher.refresh(); setBusyAvatar(false)
  }

  const genderData = [
    { label: 'إناث', value: full.gender_split.female },
    { label: 'ذكور', value: full.gender_split.male },
    { label: 'غير محدد', value: full.gender_split.unknown },
  ].filter(d => d.value > 0)
  const ageData   = (full.age_bands ?? []).map(b => ({ label: b.band, value: b.count }))
  const levelData = (full.level_split ?? []).map(l => ({ label: l.level, value: l.count }))

  const facts = [
    p.english_level && { icon: BadgeCheck, text: `إنجليزية ${p.english_level}` },
    p.years_experience != null && { icon: Briefcase, text: `${p.years_experience} سنوات خبرة` },
    (p.age_min || p.age_max) && { icon: Users, text: `أعمار ${p.age_min ?? '—'}–${p.age_max ?? '—'}` },
    p.languages?.length > 0 && { icon: Languages, text: p.languages.join(' · ') },
  ].filter(Boolean) as { icon: typeof Users; text: string }[]

  const nothingTaught = [p.levels, p.specialties, p.teaches, p.competences].every(a => !a?.length)

  return (
    <div className="space-y-6">
      {demo && <DemoBanner />}

      {/* ══ Identity — what a visitor meets, and the moves that spread it ══ */}
      <Rise>
        <Surface className="overflow-hidden">
          <div className="bg-gradient-to-br from-blue-50 via-white to-amber-50/60 px-5 sm:px-7 py-6">
            <div className="flex flex-wrap items-center gap-4 sm:gap-5">
              <div className="relative shrink-0">
                {p.avatar_url
                  ? /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={p.avatar_url} alt={name}
                         className="h-[104px] w-[104px] sm:h-[120px] sm:w-[120px] rounded-[28px] object-cover ring-4 ring-white shadow-lg" />
                  : <div className="h-[104px] w-[104px] sm:h-[120px] sm:w-[120px] rounded-[28px] ring-4 ring-white shadow-lg
                                    bg-gradient-to-br from-[#1E40AF] to-[#1E3A8A] text-[#FCD34D] flex items-center justify-center text-[40px] font-black">
                      {name.trim().charAt(0)}
                    </div>}
                <label className="absolute -bottom-1.5 -left-1.5 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full
                                  bg-white ring-1 ring-[#E2E8F0] shadow-sm transition hover:bg-[#F8FAFC]" aria-label="تغيير الصورة">
                  {busyAvatar ? <Loader2 size={14} className="animate-spin text-[#64748B]" /> : <Camera size={14} className="text-[#475569]" />}
                  <input type="file" accept="image/*" hidden onChange={onAvatar} disabled={demo} />
                </label>
              </div>

              <div className="min-w-[14rem] flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-inherit text-[26px] sm:text-[32px] font-extrabold leading-tight tracking-tight">{name}</h1>
                  {s.is_top_rated && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-l from-amber-400 to-yellow-500 text-blue-900 px-2.5 py-1 text-[11px] font-bold">
                      <Trophy size={11} /> من الأفضل تقييماً
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-[14.5px] font-medium leading-snug text-[#475569]">
                  {p.tagline || p.headline || 'أضف جملة تقول فيها ما الذي سيحققه الطالب معك.'}
                </p>
                {s.rating_count > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <Stars value={Number(s.rating_avg)} size={13} />
                    <span className="text-[12.5px] font-bold tabular-nums">{Number(s.rating_avg).toFixed(1)}</span>
                    <span className="text-[12px] font-semibold text-[#94A3B8]">({s.rating_count} تقييماً)</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <Btn icon={Pencil} onClick={() => !demo && setEditing(true)} disabled={demo}>تعديل الملف</Btn>
                <Btn href={publicHref} icon={ExternalLink} kind="ghost">عرض الملف العام</Btn>
                <ShareBtn url={publicUrl} title={name} kind="gold" />
              </div>
            </div>

            {facts.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {facts.map(f => (
                  <span key={f.text} className="inline-flex items-center gap-1.5 rounded-full bg-[#F4F7FC] px-3 py-1.5 text-[12px] font-bold text-[#475569]">
                    <f.icon size={13} className="text-[#94A3B8]" /> {f.text}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Surface>
      </Rise>

      {/* ══ The numbers behind the page ══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Rise i={0}><Kpi icon={Users} tone="violet" label="طلاب نشطون" value={s.students_active} sub={`${s.students_total} منذ البداية`} /></Rise>
        <Rise i={1}><Kpi icon={Clock} tone="emerald" label="ساعات تدريس" value={Number(s.hours_total)} decimals={Number.isInteger(Number(s.hours_total)) ? 0 : 1} unit="س" /></Rise>
        <Rise i={2}><Kpi icon={CalendarCheck} tone="sky" label="حصص منجزة" value={s.classes_done}
                         sub={s.attendance_rate != null ? `حضور ${Math.round(Number(s.attendance_rate))}%` : undefined} /></Rise>
        <Rise i={3}><Kpi icon={Star} tone="gold" label="متوسط التقييم" value={s.rating_count > 0 ? Number(s.rating_avg) : null}
                         decimals={1} unit="/ 5" sub={s.rating_count > 0 ? `من ${s.rating_count} تقييماً` : 'لا تقييمات بعد'} /></Rise>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">

        {/* ══ Main ══ */}
        <div className="lg:col-span-8 space-y-6 min-w-0">

          <Rise>
            <Surface className="p-5 sm:p-6">
              <CardHead icon={GraduationCap} tone="violet" title="ما أُدرّسه" note="أول ما يقرؤه الطالب قبل أن يتواصل"
                        action={!demo && <button onClick={() => setEditing(true)} className="text-[12px] font-bold text-[#64748B] hover:text-[#1E3A8A] px-2.5 py-1.5 rounded-full hover:bg-[#EEF2F7]">تعديل</button>} />
              {nothingTaught ? (
                <p className="text-[13.5px] leading-relaxed text-[#94A3B8]">
                  لم تُحدَّد بعد. اضغط «تعديل الملف» لتقول ما تُدرّسه — وما لا تُدرّسه.
                </p>
              ) : (
                <div className="space-y-5">
                  {p.levels?.length > 0 && (
                    <div>
                      <div className="text-[11px] font-bold tracking-[.1em] text-[#94A3B8] mb-2">المستويات</div>
                      <div className="flex flex-wrap gap-2" dir="ltr">
                        {p.levels.map(l => (
                          <span key={l} className="rounded-xl bg-gradient-to-l from-blue-600 to-blue-800 text-white px-3.5 py-1.5 text-[13px] font-extrabold">{l}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <ChipRow label="التخصصات" items={p.specialties} />
                  <ChipRow label="أُدرّس" items={p.teaches} />
                  <ChipRow label="نقاط قوتي" items={p.competences} tone="gold" />
                  <ChipRow label="لا أُدرّس" items={p.not_teaches} tone="muted" />
                </div>
              )}
            </Surface>
          </Rise>

          {p.bio && (
            <Rise>
              <Surface className="p-5 sm:p-6">
                <CardHead icon={Sparkles} tone="gold" title="نبذة" />
                <p className="text-[15px] leading-[1.9] text-[#334155] whitespace-pre-wrap">{p.bio}</p>
              </Surface>
            </Rise>
          )}

          {(p.certificates?.length > 0 || p.experiences?.length > 0) && (
            <Rise>
              <Surface className="p-5 sm:p-6">
                <CardHead icon={Award} tone="emerald" title="المؤهلات والخبرة" />
                {p.certificates?.length > 0 && (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {p.certificates.map((c, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-2xl bg-[#F8FAFC] ring-1 ring-[#E2E8F0] p-3.5">
                        <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                          <BadgeCheck size={17} />
                        </span>
                        <div className="min-w-0">
                          <div className="text-[13.5px] font-bold leading-snug">{c.title}</div>
                          {(c.issuer || c.year) && (
                            <div className="mt-0.5 text-[11.5px] font-semibold text-[#94A3B8]">{[c.issuer, c.year].filter(Boolean).join(' · ')}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {p.experiences?.length > 0 && (
                  <div className={`flex flex-wrap gap-2 ${p.certificates?.length ? 'mt-4' : ''}`}>
                    {p.experiences.map((x, i) => (
                      <span key={i} className="inline-flex items-center gap-2 rounded-full bg-white ring-1 ring-[#E2E8F0] px-3 py-1.5 text-[12px] font-semibold text-[#475569]">
                        <Briefcase size={12} className="text-[#94A3B8]" />
                        <span className="font-bold text-[#334155]">{x.role}</span>
                        {x.org && <span>· {x.org}</span>}
                        {(x.from || x.to) && <span className="text-[#94A3B8] tabular-nums">{[x.from, x.to].filter(Boolean).join('–')}</span>}
                      </span>
                    ))}
                  </div>
                )}
              </Surface>
            </Rise>
          )}

          {full.testimonials?.length > 0 && (
            <Rise>
              <Surface className="p-5 sm:p-6">
                <CardHead icon={Quote} tone="gold" title="ما قاله طلابي" note={`${full.testimonials.length} تقييماً منشوراً`}
                          action={<Link href="/teacher/reviews" className="text-[12px] font-bold text-[#64748B] hover:text-[#1E3A8A] px-2.5 py-1.5 rounded-full hover:bg-[#EEF2F7]">الكل</Link>} />
                <div className="grid sm:grid-cols-2 gap-3">
                  {full.testimonials.slice(0, 4).map(t => (
                    <figure key={t.id} className="rounded-2xl bg-[#F8FAFC] ring-1 ring-[#E2E8F0] p-4 flex flex-col">
                      <Stars value={t.rating} size={12} />
                      <blockquote className={`mt-2 text-[13.5px] leading-relaxed flex-1 ${t.comment ? 'text-[#334155]' : 'text-[#94A3B8] italic'}`}>
                        {t.comment || 'قيّم دون تعليق.'}
                      </blockquote>
                      <figcaption className="mt-3 flex items-center gap-2">
                        <Face name={t.student_name ?? 'طالب'} url={t.student_avatar} size={26} />
                        <span className="text-[12px] font-bold">{t.student_name ?? 'طالب'}</span>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </Surface>
            </Rise>
          )}

          {(genderData.length > 0 || ageData.length > 0 || levelData.length > 0) && (
            <Rise>
              <Surface className="p-5 sm:p-6">
                <CardHead icon={PieChart} tone="sky" title="من أُدرّسهم" note="يُحتسب تلقائياً من طلابك" />
                <div className="grid md:grid-cols-2 gap-6">
                  {genderData.length > 0 && (
                    <div className="flex items-center justify-center md:justify-start"><Donut data={genderData} size={128} /></div>
                  )}
                  <div className="space-y-5">
                    {levelData.length > 0 && (
                      <div>
                        <div className="mb-2.5 text-[11px] font-bold tracking-[.1em] text-[#94A3B8]">المستويات</div>
                        <HBars data={levelData} unit="" color="#1D4ED8" />
                      </div>
                    )}
                    {ageData.length > 0 && (
                      <div>
                        <div className="mb-2.5 text-[11px] font-bold tracking-[.1em] text-[#94A3B8]">الفئات العمرية</div>
                        <HBars data={ageData} unit="" color="#F59E0B" />
                      </div>
                    )}
                    {full.avg_age != null && (
                      <p className="text-[12.5px] font-semibold text-[#64748B]">
                        متوسط العمر <span className="font-extrabold text-[#1E3A8A]">{full.avg_age}</span> سنة.
                      </p>
                    )}
                  </div>
                </div>
              </Surface>
            </Rise>
          )}
        </div>

        {/* ══ Aside — completeness and the share card, sticky on desktop ══ */}
        <aside className="lg:col-span-4 space-y-6 min-w-0 lg:sticky lg:top-[88px]">
          <Rise>
            <Surface className="p-5">
              <CardHead icon={ListChecks} tone="emerald" title="اكتمال الملف"
                        note={check.pct === 100 ? 'ملفك جاهز للعرض' : `${check.items.length - check.done} عناصر متبقية`} />
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-2 rounded-full bg-[#EEF2F7] overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-l from-emerald-500 to-emerald-700 transition-all duration-700"
                       style={{ width: `${check.pct}%` }} />
                </div>
                <span className="text-[13px] font-extrabold tabular-nums">{check.pct}%</span>
              </div>
              <ul className="space-y-1.5">
                {check.items.map(c => (
                  <li key={c.label}>
                    <button onClick={() => !demo && !c.done && setEditing(true)}
                            className={`w-full text-right flex items-center gap-2.5 rounded-lg px-1 py-1 text-[12.5px] font-semibold transition-colors
                                        ${c.done ? 'text-[#94A3B8] cursor-default' : 'text-[#334155] hover:text-[#B45309]'}`}>
                      {c.done
                        ? <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        : <Circle size={16} className="text-[#CBD5E1] shrink-0" />}
                      <span className={c.done ? 'line-through decoration-[#CBD5E1]' : ''}>{c.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </Surface>
          </Rise>

          <Rise>
            <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 p-5 text-white shadow-[0_24px_50px_-28px_rgba(30,58,138,.7)]">
              <div aria-hidden className="pointer-events-none absolute -top-16 -left-16 w-56 h-56 rounded-full bg-[radial-gradient(circle,rgba(251,191,36,.3),transparent_65%)]" />
              <div className="relative">
                <div className="text-[11px] font-bold tracking-[.14em] text-[#FCD34D]">شارك ملفك</div>
                <div className="mt-1.5 text-[17px] font-extrabold leading-snug">كل مشاركة قد تعني طالباً جديداً.</div>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/85">
                  ضع الرابط في واتساب، إنستغرام أو توقيع بريدك. يرى الزائر تقييماتك ويتواصل مع الفريق مباشرة.
                </p>
                {publicUrl && (
                  <div className="mt-4 rounded-xl bg-white/[.07] ring-1 ring-white/10 px-3 py-2 text-[11.5px] font-semibold text-white/90 truncate" dir="ltr">
                    {publicUrl.replace(/^https?:\/\//, '')}
                  </div>
                )}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <ShareBtn url={publicUrl} title={name} kind="gold" label="مشاركة" />
                  <Btn href={publicHref} icon={ExternalLink} kind="glass">معاينة</Btn>
                </div>
              </div>
            </section>
          </Rise>

          {p.liked_qualities?.length > 0 && (
            <Rise>
              <Surface className="p-5">
                <CardHead icon={Heart} tone="rose" title="ما يحبه طلابي فيّ" />
                <div className="flex flex-wrap gap-2">
                  {p.liked_qualities.map(q => (
                    <span key={q} className="inline-flex items-center gap-1.5 rounded-full bg-[#FEF3C7] px-3 py-1.5 text-[12.5px] font-bold text-[#B45309]">
                      <Sparkles size={11} /> {q}
                    </span>
                  ))}
                </div>
              </Surface>
            </Rise>
          )}

          {!demo && publicUrl && (
            <div className="flex justify-center"><CopyBtn text={publicUrl} label="نسخ رابط الملف" /></div>
          )}
        </aside>
      </div>

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
