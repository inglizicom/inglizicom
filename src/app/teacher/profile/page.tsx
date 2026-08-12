'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Camera, Image as ImageIcon, Loader2, Pencil, ExternalLink, Quote,
  Star, Trophy, XCircle, FlaskConical,
} from 'lucide-react'
import { useTeacher } from '@/lib/teacher-context'
import {
  fetchTeacherProfileFull, uploadTeacherAvatar, uploadTeacherCover,
  type TeacherProfileFull,
} from '@/lib/teachers'
import { Donut, HBars } from '../_charts'
import { Reveal } from '../_motion'
import { Band, Figure, TagRow } from '../_paper'
import ProfileEditor from './ProfileEditor'
import { DEMO_PROFILE } from './demoData'

/**
 * صفحتي — a teacher's page, not their CV.
 *
 * The previous version was built as a résumé: a `cv-sheet` article with a
 * masthead, a figures band and print styles. That framing was the problem.
 * A CV is a document you submit once to be judged; this is a page a teacher
 * lives on, and the two want opposite things. A CV compresses a person into
 * columns. A page can let them breathe.
 *
 * So: no sheet, no print, no two-column résumé grid. Full-width bands
 * separated by rules, one idea per band, read top to bottom. The demographics
 * the RPC has always returned — who this teacher actually teaches — get real
 * space here instead of sitting as marginalia, because that is the part no
 * résumé could ever claim.
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
    return <div className="py-32 flex justify-center text-[#C4BEB2]"><Loader2 size={20} className="animate-spin" /></div>
  }
  if (!full) {
    return <div className="p-10 text-center font-bold text-[#78716C]">تعذّر تحميل صفحتك.</div>
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

  const genderData = [
    { label: 'إناث',   value: full.gender_split.female },
    { label: 'ذكور',   value: full.gender_split.male },
    { label: 'غير محدد', value: full.gender_split.unknown },
  ].filter(d => d.value > 0)

  const ageData   = (full.age_bands ?? []).map(b => ({ label: b.band, value: b.count }))
  const levelData = (full.level_split ?? []).map(l => ({ label: l.level, value: l.count }))

  const meta = [
    p.english_level && `إنجليزية ${p.english_level}`,
    p.years_experience != null && `${p.years_experience} سنوات خبرة`,
    (p.age_min || p.age_max) && `يدرّس ${p.age_min ?? '—'}–${p.age_max ?? '—'} سنة`,
    p.languages?.length > 0 && p.languages.join('، '),
  ].filter(Boolean) as string[]

  return (
    <div className="-mt-8 sm:-mt-10">

      {demo && (
        <div className="flex items-center gap-2.5 rounded-xl bg-fuchsia-50 ring-1 ring-fuchsia-200 px-4 py-2.5 mt-6 mb-2">
          <FlaskConical size={15} className="text-fuchsia-600 shrink-0" />
          <span className="text-[12.5px] font-semibold text-fuchsia-800">معاينة ببيانات وهمية — لا شيء هنا حقيقي.</span>
        </div>
      )}

      {/* ══ Cover ═════════════════════════════════════════ */}
      <div className="relative h-[190px] sm:h-[260px] -mx-5 sm:-mx-8 overflow-hidden bg-[#EFEBE2]">
        {p.cover_url
          ? /* eslint-disable-next-line @next/next/no-img-element */
            <img src={p.cover_url} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-[linear-gradient(115deg,#EAE4D8_0%,#F3EFE7_45%,#E3DCCB_100%)]" />}

        <label className="absolute top-4 left-4 sm:left-8 inline-flex items-center gap-1.5 px-3 py-2 rounded-full
                          bg-white/90 backdrop-blur ring-1 ring-black/5 text-[12px] font-bold text-[#44403C]
                          cursor-pointer hover:bg-white transition">
          {busyCover ? <Loader2 size={13} className="animate-spin" /> : <ImageIcon size={13} />}
          الغلاف
          <input type="file" accept="image/*" hidden onChange={onCover} disabled={demo} />
        </label>
      </div>

      {/* ══ Identity ══════════════════════════════════════ */}
      <div className="relative">
        <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-[52px] sm:-mt-[64px]">
          <div className="relative shrink-0">
            {p.avatar_url
              ? /* eslint-disable-next-line @next/next/no-img-element */
                <img src={p.avatar_url} alt={name}
                     className="w-[104px] h-[104px] sm:w-[128px] sm:h-[128px] rounded-2xl object-cover
                                ring-4 ring-[#FAF9F6] shadow-[0_10px_30px_-14px_rgba(28,25,23,.5)]" />
              : <div className="w-[104px] h-[104px] sm:w-[128px] sm:h-[128px] rounded-2xl bg-[#1C1917] text-white
                                flex items-center justify-center text-[42px] font-extrabold
                                ring-4 ring-[#FAF9F6] shadow-[0_10px_30px_-14px_rgba(28,25,23,.5)]">
                  {name.trim().charAt(0)}
                </div>}
            <label className="absolute -bottom-1.5 -left-1.5 w-9 h-9 rounded-full bg-white ring-1 ring-[#E4DFD5]
                              shadow-sm flex items-center justify-center cursor-pointer hover:bg-[#FAF9F6] transition">
              {busyAvatar ? <Loader2 size={14} className="animate-spin text-[#78716C]" />
                          : <Camera size={14} className="text-[#57534E]" />}
              <input type="file" accept="image/*" hidden onChange={onAvatar} disabled={demo} />
            </label>
          </div>

          <div className="flex-1 min-w-0 sm:pb-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-[32px] sm:text-[40px] font-extrabold tracking-tight leading-none">{name}</h1>
              {s.is_top_rated && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1C1917] text-white text-[11px] font-bold">
                  <Trophy size={11} /> من الأفضل تقييماً
                </span>
              )}
            </div>
            {(p.tagline || p.headline) && (
              <p className="text-[16px] sm:text-[17px] text-[#57534E] font-medium mt-2.5 leading-snug max-w-2xl">
                {p.tagline || p.headline}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0 sm:pb-2">
            <Link href={`/teachers/${teacher.id}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-white ring-1 ring-[#E4DFD5]
                             text-[12.5px] font-bold text-[#44403C] hover:bg-[#F6F4EF] transition">
              <ExternalLink size={13} /> العرض العام
            </Link>
            <button onClick={() => !demo && setEditing(true)} disabled={demo}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#1C1917] text-white
                               text-[12.5px] font-bold hover:bg-[#292524] transition disabled:opacity-40">
              <Pencil size={13} /> تعديل
            </button>
          </div>
        </div>

        {meta.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 mt-5 text-[13px] text-[#8A8377] font-medium">
            {meta.map((m, i) => (
              <span key={m} className="flex items-center gap-2.5">
                {i > 0 && <span className="w-1 h-1 rounded-full bg-[#D6CFC0]" />}
                {m}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ══ The figures, said plainly ═════════════════════ */}
      <div className="mt-9 flex flex-wrap gap-y-7 gap-x-4 pb-10 border-b border-[#E4DFD5]">
        <Figure value={s.students_active} label="طالباً نشطاً" />
        <Figure value={s.hours_total} unit="س" label="ساعة تدريس" />
        <Figure value={s.classes_done} label="حصة منتهية" />
        <Figure
          value={s.rating_count > 0 ? Number(s.rating_avg).toFixed(1) : '—'}
          label={s.rating_count > 0 ? `من ${s.rating_count} تقييماً` : 'لا تقييمات بعد'}
        />
      </div>

      {/* ══ Bands ═════════════════════════════════════════ */}

      {p.bio && (
        <Band title="نبذة">
          <p className="text-[17px] leading-[1.85] text-[#292524] max-w-[46rem] whitespace-pre-wrap">{p.bio}</p>
        </Band>
      )}

      <Band title="ما أُدرّسه">
        <div className="max-w-[52rem]">
          <TagRow label="المستويات"  items={p.levels} />
          <TagRow label="التخصصات"   items={p.specialties} />
          <TagRow label="أُدرّس"      items={p.teaches} />
          <TagRow label="الكفاءات"   items={p.competences} />
          {p.not_teaches?.length > 0 && <TagRow label="لا أُدرّس" items={p.not_teaches} muted />}
        </div>
        {[p.levels, p.specialties, p.teaches, p.competences].every(a => !a || a.length === 0) && (
          <p className="text-[14px] text-[#A8A29E]">
            لم تُحدَّد بعد. اضغط «تعديل» لتقول ما تُدرّسه — وما لا تُدرّسه.
          </p>
        )}
      </Band>

      {(genderData.length > 0 || ageData.length > 0 || levelData.length > 0) && (
        <Band title="من أُدرّسهم" note="يُحتسب تلقائياً من طلابك النشطين">
          <div className="grid gap-10 md:grid-cols-[auto_1fr] md:gap-14 items-start">
            {genderData.length > 0 && (
              <div>
                <Donut data={genderData} size={150} />
              </div>
            )}
            <div className="space-y-8 min-w-0">
              {ageData.length > 0 && (
                <div>
                  <div className="text-[11.5px] font-bold tracking-[.1em] uppercase text-[#B5AFA3] mb-3">الفئات العمرية</div>
                  <HBars data={ageData} unit="طالب" />
                </div>
              )}
              {levelData.length > 0 && (
                <div>
                  <div className="text-[11.5px] font-bold tracking-[.1em] uppercase text-[#B5AFA3] mb-3">المستويات</div>
                  <HBars data={levelData} unit="طالب" />
                </div>
              )}
              {full.avg_age != null && (
                <p className="text-[13.5px] text-[#8A8377] font-medium">
                  متوسط عمر طلابك <span className="text-[#1C1917] font-bold">{full.avg_age}</span> سنة.
                </p>
              )}
            </div>
          </div>
        </Band>
      )}

      {p.experiences?.length > 0 && (
        <Band title="مسيرتي">
          <ol className="relative max-w-[46rem] pr-5 border-r-2 border-[#E4DFD5] space-y-8">
            {p.experiences.map((x, i) => (
              <Reveal key={i} delay={i * 60}>
                <li className="relative">
                  <span className="absolute -right-[27px] top-1.5 w-3 h-3 rounded-full bg-[#1C1917] ring-4 ring-[#FAF9F6]" />
                  <div className="text-[17px] font-bold leading-tight">{x.role}</div>
                  <div className="text-[13.5px] text-[#8A8377] font-semibold mt-1">
                    {[x.org, [x.from, x.to].filter(Boolean).join(' — ')].filter(Boolean).join(' · ')}
                  </div>
                  {x.description && (
                    <p className="text-[14.5px] leading-relaxed text-[#57534E] mt-2.5">{x.description}</p>
                  )}
                </li>
              </Reveal>
            ))}
          </ol>
        </Band>
      )}

      {p.certificates?.length > 0 && (
        <Band title="شهاداتي">
          <div className="grid sm:grid-cols-2 gap-x-10 gap-y-5 max-w-[52rem]">
            {p.certificates.map((c, i) => (
              <div key={i} className="flex items-baseline gap-3 py-3 border-b border-[#EFEBE2]">
                <span className="text-[12px] font-bold text-[#C4BEB2] tabular-nums shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <div className="text-[15px] font-bold leading-snug">{c.title}</div>
                  {(c.issuer || c.year) && (
                    <div className="text-[12.5px] text-[#8A8377] font-medium mt-0.5">
                      {[c.issuer, c.year].filter(Boolean).join(' · ')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Band>
      )}

      {p.liked_qualities?.length > 0 && (
        <Band title="ما يحبه طلابي فيّ">
          <div className="flex flex-wrap gap-2.5 max-w-[46rem]">
            {p.liked_qualities.map(q => (
              <span key={q} className="text-[15px] font-semibold px-4 py-2.5 rounded-full bg-[#1C1917]/[.04] text-[#292524]">
                {q}
              </span>
            ))}
          </div>
        </Band>
      )}

      {full.testimonials?.length > 0 && (
        <Band title="ما قالوه" note={`${full.testimonials.length} تقييماً`}>
          <div className="grid md:grid-cols-2 gap-x-10 gap-y-8 max-w-[58rem]">
            {full.testimonials.slice(0, 6).map(t => (
              <figure key={t.id} className="relative">
                <Quote size={20} className="text-[#DDD6C8] mb-2.5" />
                {t.comment
                  ? <blockquote className="text-[15.5px] leading-relaxed text-[#292524]">{t.comment}</blockquote>
                  : <blockquote className="text-[15px] text-[#A8A29E] italic">قيّم دون تعليق.</blockquote>}
                <figcaption className="flex items-center gap-2 mt-3.5">
                  <span className="text-[13px] font-bold">{t.student_name ?? 'طالب'}</span>
                  <span className="inline-flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(n => (
                      <Star key={n} size={11}
                            className={n <= t.rating ? 'text-[#B45309]' : 'text-[#DDD6C8]'}
                            fill={n <= t.rating ? 'currentColor' : 'none'} />
                    ))}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Band>
      )}

      {!p.bio && !p.experiences?.length && !p.certificates?.length && (
        <Band title="صفحتك فارغة تقريباً">
          <div className="flex items-start gap-3 max-w-[40rem]">
            <XCircle size={18} className="text-[#C4BEB2] shrink-0 mt-0.5" />
            <p className="text-[15px] leading-relaxed text-[#57534E]">
              الأرقام أعلاه تُحتسب وحدها، لكن النبذة والخبرة والشهادات لا يعرفها أحد غيرك.
              اضغط «تعديل» — هذه الصفحة هي ما يراه الطالب قبل أن يختارك.
            </p>
          </div>
        </Band>
      )}

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
