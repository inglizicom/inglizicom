import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Star, Users, Clock3, BookOpen, Sparkles, Globe, BadgeCheck, ChevronLeft } from 'lucide-react'
import { fetchTeacherPublicProfile, type TeacherPublicProfile } from '@/lib/teacher-public'

export const revalidate = 60

interface PageProps {
  params: { teacherId: string }
}

function formatCount(value: number) {
  return value.toLocaleString('en-US')
}

function formatList(items: string[]) {
  return items.length > 0 ? items.join(' · ') : '—'
}

function statCard(label: string, value: string | number, note?: string) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="mt-2 text-sm text-slate-400">{label}</div>
      {note ? <div className="mt-3 text-xs text-slate-500">{note}</div> : null}
    </div>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-100">
      {children}
    </span>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
      <h2 className="text-lg font-black text-white mb-4">{title}</h2>
      <div className="space-y-4 text-slate-300">{children}</div>
    </section>
  )
}

function renderChips(items: string[]) {
  if (items.length === 0) {
    return <div className="text-slate-500">لا توجد بيانات.</div>
  }
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Badge key={item}>{item}</Badge>
      ))}
    </div>
  )
}

function ratingBreakdown(breakdown: Record<string, number>) {
  const ratings = [5, 4, 3, 2, 1]
  const total = Object.values(breakdown).reduce((sum, value) => sum + value, 0)

  if (total === 0) {
    return <div className="text-slate-500">لا تقييمات بعد.</div>
  }

  return (
    <div className="space-y-3">
      {ratings.map((rating) => {
        const count = breakdown[String(rating)] ?? 0
        const width = total > 0 ? Math.round((count / total) * 100) : 0
        return (
          <div key={rating} className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-3 text-sm text-slate-300">
            <span className="font-black text-white">{rating}★</span>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-amber-400" style={{ width: `${width}%` }} />
            </div>
            <span className="text-slate-500">{count}</span>
          </div>
        )
      })}
    </div>
  )
}

export async function generateMetadata({ params }: PageProps) {
  const teacher = await fetchTeacherPublicProfile(params.teacherId)
  if (!teacher) {
    return { title: 'أستاذ غير موجود | إنجليزي' }
  }

  return {
    title: `${teacher.name ?? 'الملف الشخصي'} | إنجليزي`, 
    description: teacher.profile.tagline || teacher.profile.headline || teacher.profile.bio || 'عرض لمحة عامة عن الأستاذ والمؤهلات.'
  }
}

export default async function TeacherPublicProfilePage({ params }: PageProps) {
  const teacher = await fetchTeacherPublicProfile(params.teacherId)
  if (!teacher) notFound()

  const profile = teacher.profile
  const name = teacher.name ?? 'أستاذ'
  const tagline = profile.tagline || profile.headline || 'أستاذ متمرس في اللغة الإنجليزية'
  const ageRange = profile.age_min || profile.age_max ? `${profile.age_min ?? '—'}–${profile.age_max ?? '—'} سنة` : null
  const experience = profile.years_experience != null ? `${profile.years_experience} سنوات خبرة` : null

  return (
    <main className="min-h-screen bg-slate-950 text-white pt-[80px]" dir="rtl">
      <div className="relative overflow-hidden bg-slate-900">
        {profile.cover_url ? (
          <img
            src={profile.cover_url}
            alt={name}
            className="w-full h-80 object-cover opacity-90"
          />
        ) : (
          <div className="h-80 w-full bg-gradient-to-r from-slate-800 via-slate-900 to-slate-950" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto flex max-w-6xl items-end justify-between px-6 pb-5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-900 transition"
          >
            <ChevronLeft className="w-4 h-4" /> العودة إلى الصفحة الرئيسية
          </Link>

          <div className="rounded-3xl bg-slate-950/80 border border-white/10 px-4 py-3 text-sm text-slate-300">
            ملف الأستاذ العام
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/30 sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-4">
                    <div className="relative h-24 w-24 overflow-hidden rounded-3xl bg-slate-800 ring-1 ring-white/10">
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt={name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-slate-700 text-3xl font-black text-white">{name.slice(0, 1)}</div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">أستاذ</p>
                      <h1 className="mt-2 text-4xl font-black tracking-tight text-white">{name}</h1>
                      <p className="mt-3 text-sm leading-7 text-slate-300 max-w-2xl">{tagline}</p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">المستوى</p>
                      <p className="mt-2 text-base font-semibold text-white">{formatList(profile.levels)}</p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">اللغات</p>
                      <p className="mt-2 text-base font-semibold text-white">{formatList(profile.languages)}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:w-[18rem]">
                  {statCard('الطلّاب', formatCount(teacher.stats.students_total))}
                  {statCard('التقييم', `${teacher.stats.rating_avg.toFixed(1)} ★`, `${formatCount(teacher.stats.rating_count)} تقييم`)}
                  {statCard('الحصص المكتملة', formatCount(teacher.stats.classes_done))}
                  {statCard('ساعات التدريس', `${teacher.stats.hours_total}h`)}
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
              <Section title="نبذة عن الأستاذ">
                <p className="leading-7 text-slate-300 whitespace-pre-wrap">
                  {profile.bio || 'لا توجد نبذة حالياً. يُرجى زيارة صفحة الأستاذ لاحقاً لمزيد من التفاصيل.'}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {experience && (
                    <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">الخبرة</p>
                      <p className="mt-2 text-sm font-semibold text-white">{experience}</p>
                    </div>
                  )}
                  {ageRange && (
                    <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">الفئة العمرية</p>
                      <p className="mt-2 text-sm font-semibold text-white">{ageRange}</p>
                    </div>
                  )}
                </div>
              </Section>

              <Section title="المهارات والتخصصات">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">التخصصات</h3>
                  <div className="mt-3">{renderChips(profile.specialties)}</div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">ما يدرّسه</h3>
                  <div className="mt-3">{renderChips(profile.teaches)}</div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">الكفاءات</h3>
                  <div className="mt-3">{renderChips(profile.competences)}</div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">سمات محبوبة</h3>
                  <div className="mt-3">{renderChips(profile.liked_qualities)}</div>
                </div>
              </Section>
            </div>

            {profile.experiences.length > 0 && (
              <Section title="الخبرة العملية">
                <div className="space-y-4">
                  {profile.experiences.map((entry, index) => (
                    <div key={`${entry.role}-${index}`} className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{entry.role}</p>
                          {entry.org ? <p className="text-sm text-slate-400 mt-1">{entry.org}</p> : null}
                        </div>
                        <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                          {[entry.from, entry.to].filter(Boolean).join(' – ') || '—'}
                        </div>
                      </div>
                      {entry.description ? <p className="mt-3 text-sm leading-7 text-slate-300">{entry.description}</p> : null}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {profile.certificates.length > 0 && (
              <Section title="الشهادات">
                <div className="grid gap-3">
                  {profile.certificates.map((certificate, index) => (
                    <div key={`${certificate.title}-${index}`} className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="font-semibold text-white">{certificate.title}</p>
                        <span className="text-xs uppercase tracking-[0.14em] text-slate-500">{certificate.year ?? ''}</span>
                      </div>
                      {certificate.issuer ? <p className="mt-2 text-sm text-slate-400">{certificate.issuer}</p> : null}
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/10">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-slate-400">التقييم العام</p>
                  <p className="mt-2 text-3xl font-black text-white">{teacher.stats.rating_avg.toFixed(1)}</p>
                </div>
                <div className="rounded-3xl bg-slate-950/80 px-4 py-2 text-sm font-semibold text-amber-300">{formatCount(teacher.stats.rating_count)} تقييم</div>
              </div>
              <div className="mt-6 space-y-4">
                <div className="rounded-3xl bg-slate-950/80 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">الطلّاب الحاليون</p>
                  <p className="mt-2 text-xl font-semibold text-white">{formatCount(teacher.stats.students_total)}</p>
                </div>
                <div className="rounded-3xl bg-slate-950/80 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">حصص قادمة</p>
                  <p className="mt-2 text-xl font-semibold text-white">{formatCount(teacher.stats.upcoming)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-6">
              <h2 className="text-lg font-black text-white mb-4">دعوة للحجز</h2>
              <p className="text-sm leading-7 text-slate-300 mb-6">
                احجز درساً خاصاً أو تواصل معنا لترتيب جدول يناسبك. مستوى الحصص وأسعارها يختلفان حسب هدفك.
              </p>
              <Link
                href="/classes"
                className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-amber-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-amber-300"
              >
                عرض الحصص المتاحة
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-6">
              <h2 className="text-lg font-black text-white mb-4">ملاحظات سريعة</h2>
              <div className="space-y-3 text-sm leading-6 text-slate-300">
                <p className="inline-flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-300" /> خبرة في التدريس الشخصي والمحادثة.</p>
                <p className="inline-flex items-center gap-2"><Globe className="w-4 h-4 text-slate-400" /> لغات التدريس: {formatList(profile.languages)}</p>
                <p className="inline-flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-slate-400" /> أسلوب تعليمي مخصص لكل طالب.</p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-6">
              <h2 className="text-lg font-black text-white mb-4">تفاصيل التقييم</h2>
              {ratingBreakdown(teacher.rating_breakdown)}
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
