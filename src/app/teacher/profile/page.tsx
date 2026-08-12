'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Camera, Image as ImageIcon, Loader2, Pencil, ExternalLink, Quote,
  Star, Trophy, FlaskConical, Sparkles,
} from 'lucide-react'
import { useTeacher } from '@/lib/teacher-context'
import {
  fetchTeacherProfileFull, uploadTeacherAvatar, uploadTeacherCover,
  type TeacherProfileFull,
} from '@/lib/teachers'
import { Donut, HBars } from '../_charts'
import { Reveal } from '../_motion'
import ProfileEditor from './ProfileEditor'
import { DEMO_PROFILE } from './demoData'

/**
 * صفحتي — a teacher's page, not their CV.
 *
 * The previous version was built as a résumé: a `cv-sheet` article with a
 * masthead, a figures band and print styles. A CV compresses a person into
 * columns to be judged once; this is a page a teacher lives on.
 *
 * It is also laid out across the full measure. The first pass kept everything
 * in a 46rem reading column, which under RTL pinned every chip and paragraph
 * to the right edge and left two thirds of the screen empty. Long-form prose
 * wants a column; a profile of lists, tags and charts wants both sides.
 */

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-2xl ring-1 ring-[#E4DFD5] ${className}`}>{children}</div>
}

function Label({ children, note }: { children: React.ReactNode; note?: string }) {
  return (
    <div className="flex items-baseline gap-2.5 mb-4">
      <h2 className="text-[12px] font-bold tracking-[.14em] uppercase text-[#A8A29E]">{children}</h2>
      {note && <span className="text-[11.5px] text-[#C4BEB2]">{note}</span>}
    </div>
  )
}

function Tags({ label, items, muted = false }: { label: string; items: string[]; muted?: boolean }) {
  if (!items?.length) return null
  return (
    <div className="py-3.5 border-b border-[#EFEBE2] last:border-0">
      <div className="text-[11px] font-bold tracking-[.1em] uppercase text-[#B5AFA3] mb-2.5">{label}</div>
      <div className="flex flex-wrap gap-2">
        {items.map(t => (
          <span key={t}
                className={`text-[13.5px] font-semibold leading-none px-3 py-2 rounded-full
                            ${muted
                              ? 'text-[#8A8377] bg-[#F2EFE8] line-through decoration-[#D6CFC0]'
                              : 'text-[#292524] bg-[#FAF9F6] ring-1 ring-[#E4DFD5]'}`}>
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

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
    { label: 'إناث', value: full.gender_split.female },
    { label: 'ذكور', value: full.gender_split.male },
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

  const figures = [
    { v: s.students_active, u: '', l: 'طالباً نشطاً' },
    { v: s.hours_total, u: 'س', l: 'ساعة تدريس' },
    { v: s.classes_done, u: '', l: 'حصة منتهية' },
    { v: s.rating_count > 0 ? Number(s.rating_avg).toFixed(1) : '—', u: '',
      l: s.rating_count > 0 ? `من ${s.rating_count} تقييماً` : 'لا تقييمات' },
  ]

  return (
    <div className="space-y-6">
      {demo && (
        <div className="flex items-center gap-2.5 rounded-xl bg-fuchsia-50 ring-1 ring-fuchsia-200 px-4 py-2.5">
          <FlaskConical size={15} className="text-fuchsia-600 shrink-0" />
          <span className="text-[12.5px] font-semibold text-fuchsia-800">معاينة ببيانات وهمية — لا شيء هنا حقيقي.</span>
        </div>
      )}

      {/* ══ Identity ══════════════════════════════════════ */}
      <Card className="overflow-hidden">
        <div className="relative h-[132px] sm:h-[168px] bg-[#EFEBE2]">
          {p.cover_url
            ? /* eslint-disable-next-line @next/next/no-img-element */
              <img src={p.cover_url} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-[linear-gradient(115deg,#E9E2D4_0%,#F4F0E8_48%,#E2DAC8_100%)]" />}
          <label className="absolute top-3.5 left-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                            bg-white/90 backdrop-blur ring-1 ring-black/5 text-[11.5px] font-bold text-[#44403C]
                            cursor-pointer hover:bg-white transition">
            {busyCover ? <Loader2 size={12} className="animate-spin" /> : <ImageIcon size={12} />}
            الغلاف
            <input type="file" accept="image/*" hidden onChange={onCover} disabled={demo} />
          </label>
        </div>

        <div className="px-6 pb-6">
          {/* Only the avatar laps onto the cover. Pulling the whole row up
              drags the name and the badge onto the image with it. */}
          <div className="flex flex-wrap items-end gap-4 pt-4">
            <div className="relative shrink-0 -mt-[76px]">
              {p.avatar_url
                ? /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={p.avatar_url} alt={name}
                       className="w-[92px] h-[92px] rounded-2xl object-cover ring-4 ring-white shadow-sm" />
                : <div className="w-[92px] h-[92px] rounded-2xl bg-[#1C1917] text-white flex items-center
                                  justify-center text-[34px] font-extrabold ring-4 ring-white shadow-sm">
                    {name.trim().charAt(0)}
                  </div>}
              <label className="absolute -bottom-1 -left-1 w-8 h-8 rounded-full bg-white ring-1 ring-[#E4DFD5]
                                shadow-sm flex items-center justify-center cursor-pointer hover:bg-[#FAF9F6] transition">
                {busyAvatar ? <Loader2 size={13} className="animate-spin text-[#78716C]" />
                            : <Camera size={13} className="text-[#57534E]" />}
                <input type="file" accept="image/*" hidden onChange={onAvatar} disabled={demo} />
              </label>
            </div>

            <div className="flex-1 min-w-[14rem] pb-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-[27px] sm:text-[32px] font-extrabold tracking-tight leading-none">{name}</h1>
                {s.is_top_rated && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1C1917] text-white text-[10.5px] font-bold">
                    <Trophy size={10} /> من الأفضل تقييماً
                  </span>
                )}
              </div>
              {(p.tagline || p.headline) && (
                <p className="text-[14.5px] text-[#57534E] font-medium mt-2 leading-snug">{p.tagline || p.headline}</p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0 pb-1">
              <Link href={`/teachers/${teacher.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-white ring-1 ring-[#E4DFD5]
                               text-[12.5px] font-bold text-[#44403C] hover:ring-[#1C1917] transition">
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
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 mt-5 text-[12.5px] text-[#8A8377] font-semibold">
              {meta.map((m, i) => (
                <span key={m} className="flex items-center gap-2.5">
                  {i > 0 && <span className="w-1 h-1 rounded-full bg-[#D6CFC0]" />}
                  {m}
                </span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 mt-6 pt-5 border-t border-[#EFEBE2]
                          divide-x divide-x-reverse divide-[#EFEBE2]">
            {figures.map(f => (
              <div key={f.l} className="px-4 first:pr-0">
                <div className="flex items-baseline gap-1">
                  <span className="text-[26px] font-extrabold tracking-tight tabular-nums leading-none">{f.v}</span>
                  {f.u && <span className="text-[12.5px] font-bold text-[#A8A29E]">{f.u}</span>}
                </div>
                <div className="text-[11.5px] font-semibold text-[#8A8377] mt-1.5">{f.l}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* ══ Two columns ═══════════════════════════════════ */}
      <div className="grid lg:grid-cols-[1.1fr_.9fr] gap-6 items-start">

        <div className="space-y-6">
          {p.bio && (
            <Card className="p-6">
              <Label>نبذة</Label>
              <p className="text-[15.5px] leading-[1.85] text-[#292524] whitespace-pre-wrap">{p.bio}</p>
            </Card>
          )}

          {p.experiences?.length > 0 && (
            <Card className="p-6">
              <Label>مسيرتي</Label>
              <ol className="relative pr-5 border-r-2 border-[#EFEBE2] space-y-6">
                {p.experiences.map((x, i) => (
                  <Reveal key={i} delay={i * 60}>
                    <li className="relative">
                      <span className="absolute -right-[27px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#1C1917] ring-4 ring-white" />
                      <div className="text-[15.5px] font-bold leading-tight">{x.role}</div>
                      <div className="text-[12.5px] text-[#8A8377] font-semibold mt-1">
                        {[x.org, [x.from, x.to].filter(Boolean).join(' — ')].filter(Boolean).join(' · ')}
                      </div>
                      {x.description && (
                        <p className="text-[13.5px] leading-relaxed text-[#57534E] mt-2">{x.description}</p>
                      )}
                    </li>
                  </Reveal>
                ))}
              </ol>
            </Card>
          )}

          {full.testimonials?.length > 0 && (
            <Card className="p-6">
              <Label note={`${full.testimonials.length} تقييماً`}>ما قالوه</Label>
              <div className="space-y-5">
                {full.testimonials.slice(0, 5).map(t => (
                  <figure key={t.id} className="pb-5 border-b border-[#EFEBE2] last:border-0 last:pb-0">
                    <Quote size={16} className="text-[#DDD6C8] mb-2" />
                    {t.comment
                      ? <blockquote className="text-[14.5px] leading-relaxed text-[#292524]">{t.comment}</blockquote>
                      : <blockquote className="text-[14px] text-[#A8A29E] italic">قيّم دون تعليق.</blockquote>}
                    <figcaption className="flex items-center gap-2 mt-2.5">
                      <span className="text-[12.5px] font-bold">{t.student_name ?? 'طالب'}</span>
                      <span className="inline-flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(n => (
                          <Star key={n} size={10}
                                className={n <= t.rating ? 'text-[#B45309]' : 'text-[#DDD6C8]'}
                                fill={n <= t.rating ? 'currentColor' : 'none'} />
                        ))}
                      </span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <Label>ما أُدرّسه</Label>
            {[p.levels, p.specialties, p.teaches, p.competences].every(a => !a?.length) ? (
              <p className="text-[13.5px] text-[#A8A29E] leading-relaxed">
                لم تُحدَّد بعد. اضغط «تعديل» لتقول ما تُدرّسه — وما لا تُدرّسه.
              </p>
            ) : (
              <>
                <Tags label="المستويات" items={p.levels} />
                <Tags label="التخصصات"  items={p.specialties} />
                <Tags label="أُدرّس"     items={p.teaches} />
                <Tags label="الكفاءات"  items={p.competences} />
                <Tags label="لا أُدرّس"  items={p.not_teaches} muted />
              </>
            )}
          </Card>

          {(genderData.length > 0 || ageData.length > 0 || levelData.length > 0) && (
            <Card className="p-6">
              <Label note="يُحتسب تلقائياً">من أُدرّسهم</Label>
              <div className="space-y-6">
                {genderData.length > 0 && (
                  <div className="flex justify-center"><Donut data={genderData} size={132} /></div>
                )}
                {ageData.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold tracking-[.1em] uppercase text-[#B5AFA3] mb-2.5">الفئات العمرية</div>
                    <HBars data={ageData} unit="طالب" />
                  </div>
                )}
                {levelData.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold tracking-[.1em] uppercase text-[#B5AFA3] mb-2.5">المستويات</div>
                    <HBars data={levelData} unit="طالب" />
                  </div>
                )}
                {full.avg_age != null && (
                  <p className="text-[12.5px] text-[#8A8377] font-semibold">
                    متوسط العمر <span className="text-[#1C1917] font-bold">{full.avg_age}</span> سنة.
                  </p>
                )}
              </div>
            </Card>
          )}

          {p.certificates?.length > 0 && (
            <Card className="p-6">
              <Label>شهاداتي</Label>
              <div className="space-y-0">
                {p.certificates.map((c, i) => (
                  <div key={i} className="flex items-baseline gap-3 py-3 border-b border-[#EFEBE2] last:border-0">
                    <span className="text-[11px] font-bold text-[#C4BEB2] tabular-nums shrink-0">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[14px] font-bold leading-snug">{c.title}</div>
                      {(c.issuer || c.year) && (
                        <div className="text-[12px] text-[#8A8377] font-semibold mt-0.5">
                          {[c.issuer, c.year].filter(Boolean).join(' · ')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {p.liked_qualities?.length > 0 && (
            <Card className="p-6">
              <Label>ما يحبه طلابي فيّ</Label>
              <div className="flex flex-wrap gap-2">
                {p.liked_qualities.map(q => (
                  <span key={q} className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold px-3 py-2
                                            rounded-full bg-[#FDF6EC] text-[#92400E] ring-1 ring-[#F3E3CB]">
                    <Sparkles size={11} /> {q}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </div>
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
