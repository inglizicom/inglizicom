import Link from 'next/link'
import {
  ArrowRight, Award, BadgeCheck, BookOpen, Briefcase, CalendarClock, CalendarDays, CheckCircle2, Clock,
  GraduationCap, Globe2, LineChart, MessageCircle, ShieldCheck, Sparkles, Star, UserRound, Users,
} from 'lucide-react'
import type { TeacherPublicProfile } from '@/lib/teacher-public'
import ShareProfileButton from './ShareProfileButton'
import ProfileTabs from './ProfileTabs'

const ACADEMY_WHATSAPP = '212764189311'
const DEMO_AVATAR = 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=720&q=85'

/** Morocco's working week, Monday first. `n` is JavaScript's getDay(). */
const WEEK = [
  { n: 1, label: 'الإثنين' }, { n: 2, label: 'الثلاثاء' }, { n: 3, label: 'الأربعاء' },
  { n: 4, label: 'الخميس' }, { n: 5, label: 'الجمعة' }, { n: 6, label: 'السبت' }, { n: 0, label: 'الأحد' },
]

export const DEMO_PUBLIC_TEACHER: TeacherPublicProfile = {
  id: 'demo',
  name: 'ريم الكتاني',
  profile: {
    display_name: 'ريم الكتاني',
    headline: 'مدرّسة محادثة وإنجليزية الأعمال',
    bio: 'أساعد المتعلمين على استخدام الإنجليزية بثقة في مواقف الحياة والعمل. حصصي عملية، بأهداف واضحة وتغذية راجعة بعد كل لقاء.\n\nنبدأ من مستواك الحقيقي، ونبني خطة قصيرة المدى تعرف فيها ما الذي ستتقنه كل أسبوع.',
    avatar_url: DEMO_AVATAR,
    cover_url: null,
    tagline: 'تحدث بثقة أكبر، خطوة عملية في كل حصة.',
    english_level: 'C1',
    levels: ['A1', 'A2', 'B1', 'B2'],
    specialties: ['المحادثة', 'إنجليزية الأعمال', 'النطق', 'تحضير IELTS'],
    languages: ['العربية', 'الإنجليزية', 'الفرنسية'],
    competences: ['ممارسة موجهة على مواقف حقيقية', 'أهداف تعلم واضحة لكل حصة', 'تصحيح النطق أثناء الكلام', 'تغذية راجعة بعد كل لقاء'],
    liked_qualities: [],
    certificates: [
      { title: 'شهادة تدريس اللغة الإنجليزية', issuer: 'نموذج توضيحي', year: '2022' },
      { title: 'إنجليزية الأعمال', issuer: 'نموذج توضيحي', year: '2023' },
    ],
    experiences: [
      { role: 'مدرّسة إنجليزية', org: 'إنجليزي.كوم', from: '2022', to: 'الآن', description: 'حصص محادثة وممارسة موجهة لمستويات متعددة.' },
    ],
    teaches: ['المحادثة اليومية', 'إنجليزية الاجتماعات', 'النطق'],
    not_teaches: [],
    age_min: 16,
    age_max: null,
    years_experience: 4,
    availability: [
      { day: 1, from: '18:00', to: '21:00' }, { day: 2, from: '18:00', to: '21:00' },
      { day: 3, from: '17:00', to: '20:00' }, { day: 4, from: '18:00', to: '21:00' },
      { day: 6, from: '10:00', to: '13:00' },
    ],
    hired_at: '2022-01-10',
  },
  stats: {
    students_total: 38, classes_done: 214, hours_total: 286,
    exams_corrected: 0, rating_avg: 4.9, rating_count: 26,
    is_top_rated: true, upcoming: 0,
  },
  rating_breakdown: { '5': 24, '4': 2, '3': 0, '2': 0, '1': 0 },
  reviews: [
    { rating: 5, comment: 'صرت أتكلم في الاجتماعات بدون خوف. كل حصة فيها شيء أطبقه في نفس الأسبوع.', created_at: '2026-09-20T10:00:00Z' },
    { rating: 5, comment: 'تصحيح النطق لطيف وواضح، والحصص منظمة جداً.', created_at: '2026-09-02T10:00:00Z' },
    { rating: 4, comment: 'أمثلة من الواقع وتمارين مفيدة. أنصح بها لمن يريد المحادثة.', created_at: '2026-08-15T10:00:00Z' },
  ],
}

const fmt = (n: number) => n.toLocaleString('en-US')

function ago(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 864e5)
  if (days <= 0) return 'اليوم'
  if (days < 7) return `قبل ${days} أيام`
  if (days < 30) return `قبل ${Math.round(days / 7)} أسابيع`
  if (days < 365) return `قبل ${Math.round(days / 30)} أشهر`
  return `قبل ${Math.round(days / 365)} سنة`
}

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} من 5`}>
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} size={size} className={n <= Math.round(value) ? 'text-amber-400' : 'text-[#CBD5E1]'}
              fill={n <= Math.round(value) ? 'currentColor' : 'none'} />
      ))}
    </span>
  )
}

const CARD = 'rounded-[24px] bg-white ring-1 ring-[#D6DFEC] shadow-[0_1px_3px_rgba(30,58,138,.10),0_12px_32px_-10px_rgba(30,58,138,.26)] transition-shadow duration-300 hover:shadow-[0_2px_6px_rgba(30,58,138,.12),0_22px_44px_-12px_rgba(30,58,138,.34)]'

function CardTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-4 text-[17px] font-extrabold tracking-tight text-[#1E3A8A]">{children}</h2>
}

/**
 * A teacher's public page — built to be shared and to convert.
 *
 * It reads in the order a visitor decides: a light hero card (face, rating,
 * the four facts that matter, what they specialise in, one call to action),
 * a trust strip, then tabbed sections — about, qualifications, method,
 * schedule, reviews — beside a sticky card that turns interest into a
 * WhatsApp conversation with the team. The one action repeats at the foot of
 * the page and stays pinned to the bottom of the screen on a phone.
 */
export default function TeacherPublicProfileView({ teacher, demo = false }: {
  teacher: TeacherPublicProfile
  demo?: boolean
}) {
  const profile = teacher.profile
  const stats = teacher.stats
  const name = teacher.name || 'أستاذ إنجليزي.كوم'
  const first = name.split(' ')[0]
  const specialties = profile.specialties.length ? profile.specialties : profile.teaches
  const wa = `https://wa.me/${ACADEMY_WHATSAPP}?text=${encodeURIComponent(`السلام عليكم، أود الاستفسار عن الدراسة مع ${name}.`)}`
  const rated = stats.rating_count > 0
  const reviews = teacher.reviews ?? []
  const breakdownTotal = Object.values(teacher.rating_breakdown ?? {}).reduce((a, b) => a + b, 0)
  const availability = profile.availability ?? []
  const method = profile.competences.length ? profile.competences : profile.teaches
  const hasQualifications = profile.certificates.length > 0 || profile.experiences.length > 0
  const since = profile.hired_at
    ? new Date(profile.hired_at).toLocaleDateString('ar-MA', { month: 'long', year: 'numeric' })
    : null

  const facts = [
    profile.years_experience != null && { icon: Briefcase, value: `${profile.years_experience}+ سنوات`, label: 'خبرة في التدريس' },
    { icon: Users, value: fmt(stats.students_total), label: 'طالب يتعلّم حالياً' },
    specialties.length > 0 && { icon: BookOpen, value: specialties.slice(0, 2).join('، '), label: 'التخصص' },
    profile.languages.length > 0 && { icon: Globe2, value: profile.languages.slice(0, 2).join('، '), label: 'لغة التواصل' },
  ].filter(Boolean).slice(0, 4) as { icon: typeof Users; value: string; label: string }[]

  const info = [
    profile.english_level && { k: 'المستوى في الإنجليزية', v: profile.english_level },
    profile.levels.length > 0 && { k: 'المستويات', v: profile.levels.join(' · ') },
    (profile.age_min || profile.age_max) && { k: 'الأعمار', v: profile.age_max ? `${profile.age_min ?? '—'}–${profile.age_max} سنة` : `${profile.age_min}+ سنة` },
    { k: 'الحصص المنجزة', v: fmt(stats.classes_done) },
    { k: 'ساعات التدريس', v: fmt(Math.round(stats.hours_total)) },
    since && { k: 'عضو منذ', v: since },
  ].filter(Boolean) as { k: string; v: string }[]

  const tabs = [
    { id: 'about', label: 'نبذة' },
    hasQualifications && { id: 'qualifications', label: 'المؤهلات' },
    method.length > 0 && { id: 'method', label: 'طريقة التدريس' },
    { id: 'schedule', label: 'المواعيد' },
    rated && { id: 'reviews', label: `التقييمات (${stats.rating_count})` },
  ].filter(Boolean) as { id: string; label: string }[]

  const gold = 'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-amber-400 to-yellow-500 text-blue-900 ring-1 ring-amber-300 px-5 py-3 text-[14px] font-extrabold shadow-lg shadow-amber-500/25 transition hover:shadow-amber-500/40'
  const outline = 'inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-[14px] font-bold text-blue-800 ring-1 ring-[#CBD5E1] transition hover:ring-blue-400 hover:bg-blue-50'

  return (
    <main dir="rtl" className="min-h-screen bg-[#EEF3FA] font-paper text-[#334155] antialiased">

      {/* ══ Top bar — the site's blue header ══ */}
      <header className="sticky top-0 z-30 border-b border-amber-400/30 bg-gradient-to-l from-blue-700 to-blue-800 text-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="text-[18px] font-extrabold">إنجليزي<span className="text-amber-400">.</span>كوم</Link>
          <div className="flex items-center gap-2">
            <ShareProfileButton title={name}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3.5 py-2 text-[13px] font-bold ring-1 ring-white/20 hover:bg-white/25" />
            <a href={wa} target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-l from-amber-400 to-yellow-500 px-4 py-2 text-[13px] font-extrabold text-blue-900">
              ابدأ الآن
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pb-32 sm:px-6 lg:pb-16">
        <Link href="/" className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-bold text-[#64748B] hover:text-blue-700">
          <ArrowRight size={15} /> كل الأساتذة
        </Link>

        {demo && (
          <div role="note" className="mt-4 rounded-xl bg-amber-50 px-4 py-2.5 text-center text-[12.5px] font-bold text-amber-800 ring-1 ring-amber-200">
            معاينة تجريبية — الاسم والأرقام هنا ليست لأستاذ حقيقي.
          </div>
        )}

        {/* ══ Hero card ══ */}
        <section className="mt-4 overflow-hidden rounded-[28px] bg-white ring-1 ring-[#D6DFEC] shadow-[0_2px_6px_rgba(30,58,138,.10),0_24px_50px_-16px_rgba(30,58,138,.32)]">
          <div className="grid gap-6 bg-gradient-to-br from-blue-50 via-white to-amber-50/60 p-4 sm:p-6 lg:grid-cols-[300px_1fr] lg:gap-8">
            {/* portrait */}
            <div className="relative mx-auto w-full max-w-[300px]">
              <div className="aspect-[4/5] overflow-hidden rounded-[22px] bg-gradient-to-br from-blue-100 to-blue-200 shadow-lg">
                {profile.avatar_url
                  ? /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={profile.avatar_url} alt={name} className="h-full w-full object-cover" />
                  : <div className="flex h-full items-center justify-center text-[96px] font-black text-blue-700/70">{name.slice(0, 1)}</div>}
              </div>
              <span className="absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-blue-900/80 px-3.5 py-1.5 text-[12px] font-bold text-white backdrop-blur">
                <Star size={13} className="text-amber-400" fill="currentColor" />
                {stats.is_top_rated ? 'من الأفضل تقييماً' : 'أستاذ معتمد'}
              </span>
            </div>

            {/* identity */}
            <div className="min-w-0 py-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-[28px] font-extrabold leading-tight tracking-tight text-[#1E3A8A] sm:text-[36px]">{name}</h1>
                <BadgeCheck size={24} className="text-blue-600" aria-label="أستاذ موثّق" />
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11.5px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> متاح للتسجيل
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-[15.5px] font-bold text-[#334155]">{profile.headline || 'أستاذ إنجليزية'}</span>
                {rated && (
                  <a href="#reviews" className="inline-flex items-center gap-1.5">
                    <Stars value={stats.rating_avg} size={15} />
                    <span className="text-[13px] font-bold text-[#334155]">{stats.rating_avg.toFixed(1)}</span>
                    <span className="text-[12.5px] text-[#64748B]">({stats.rating_count} تقييماً)</span>
                  </a>
                )}
              </div>

              {facts.length > 0 && (
                <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4">
                  {facts.map(f => (
                    <div key={f.label} className="flex min-w-0 items-start gap-2.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm ring-1 ring-blue-100">
                        <f.icon size={17} />
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-[13.5px] font-extrabold text-[#1E3A8A]">{f.value}</div>
                        <div className="text-[11.5px] font-semibold text-[#64748B]">{f.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="mt-5 max-w-2xl text-[14.5px] leading-relaxed text-[#475569] line-clamp-3">
                {profile.tagline || profile.bio || 'تعلّم الإنجليزية بثقة، مع متابعة شخصية في كل حصة.'}
              </p>

              {specialties.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-[13px] font-extrabold text-[#1E3A8A]">متخصص في:</span>
                  {specialties.map(s => (
                    <span key={s} className="rounded-lg bg-blue-50 px-3 py-1.5 text-[12.5px] font-bold text-blue-700 ring-1 ring-blue-100">{s}</span>
                  ))}
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-2.5">
                <a href={wa} target="_blank" rel="noopener noreferrer" className={gold}>
                  <CalendarDays size={17} /> ابدأ مع {first}
                </a>
                <a href={wa} target="_blank" rel="noopener noreferrer" className={outline}>
                  <MessageCircle size={17} /> راسل الفريق
                </a>
              </div>
            </div>
          </div>

          {/* trust strip */}
          <div className="grid grid-cols-2 gap-px bg-[#EEF2F7] lg:grid-cols-4">
            {[
              { icon: ShieldCheck,   t: 'أستاذ معتمد',    d: 'ضمن فريق إنجليزي.كوم' },
              { icon: UserRound,     t: 'حصص مخصّصة',     d: 'حسب مستواك وهدفك' },
              { icon: CalendarClock, t: 'صيغة مرنة',      d: 'فردي أو ضمن مجموعة' },
              { icon: LineChart,     t: 'متابعة التقدّم', d: 'تقارير بعد الحصص' },
            ].map(x => (
              <div key={x.t} className="flex items-center gap-3 bg-white px-4 py-4 sm:px-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700"><x.icon size={18} /></span>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-extrabold text-[#1E3A8A]">{x.t}</div>
                  <div className="truncate text-[12px] text-[#64748B]">{x.d}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ Tabs + content + sticky booking card ══ */}
        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          <div className="min-w-0 space-y-6 lg:col-span-8">
            <ProfileTabs tabs={tabs} />

            {/* about */}
            <section id="about" className="scroll-mt-32">
              <div className="grid gap-6 md:grid-cols-[1fr_260px]">
                <div>
                  <h2 className="text-[20px] font-extrabold tracking-tight text-[#1E3A8A]">تعرّف على {first}</h2>
                  <p className="mt-3 whitespace-pre-wrap text-[14.5px] leading-[1.95] text-[#475569]">
                    {profile.bio || 'تواصل معنا لنتعرّف على أهدافك ونرتّب لك الحصص المناسبة.'}
                  </p>
                </div>
                <dl className="self-start rounded-2xl bg-[#F8FAFC] p-4 ring-1 ring-[#E2E8F0]">
                  {info.map(r => (
                    <div key={r.k} className="flex items-center justify-between gap-3 border-b border-[#E2E8F0] py-2.5 last:border-0">
                      <dt className="text-[12.5px] font-bold text-[#1E3A8A]">{r.k}</dt>
                      <dd className="text-[12.5px] font-semibold tabular-nums text-[#475569]">{r.v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </section>

            {/* qualifications + method */}
            {(hasQualifications || method.length > 0) && (
              <div className={`grid gap-6 ${hasQualifications && method.length ? 'md:grid-cols-2' : ''}`}>
                {hasQualifications && (
                  <section id="qualifications" className={`scroll-mt-32 p-5 ${CARD}`}>
                    <CardTitle>المؤهلات والشهادات</CardTitle>
                    <ul className="divide-y divide-[#EEF2F7]">
                      {profile.certificates.map((c, i) => (
                        <li key={`c${i}`} className="flex items-start gap-3 py-3 first:pt-0">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Award size={17} /></span>
                          <div className="min-w-0 flex-1">
                            <div className="text-[13.5px] font-bold text-[#1E3A8A]">{c.title}</div>
                            {c.issuer && <div className="text-[12px] text-[#64748B]">{c.issuer}</div>}
                          </div>
                          {c.year && <span className="text-[12px] font-bold tabular-nums text-[#94A3B8]">{c.year}</span>}
                        </li>
                      ))}
                      {profile.experiences.map((x, i) => (
                        <li key={`x${i}`} className="flex items-start gap-3 py-3 first:pt-0">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><GraduationCap size={17} /></span>
                          <div className="min-w-0 flex-1">
                            <div className="text-[13.5px] font-bold text-[#1E3A8A]">{x.role}</div>
                            {x.org && <div className="text-[12px] text-[#64748B]">{x.org}</div>}
                          </div>
                          {(x.from || x.to) && <span className="text-[12px] font-bold tabular-nums text-[#94A3B8]">{[x.from, x.to].filter(Boolean).join('–')}</span>}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                {method.length > 0 && (
                  <section id="method" className={`scroll-mt-32 p-5 ${CARD}`}>
                    <CardTitle>طريقة التدريس</CardTitle>
                    <ul className="space-y-3">
                      {method.map(m => (
                        <li key={m} className="flex items-start gap-2.5 text-[13.5px] font-semibold text-[#334155]">
                          <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-blue-600" /> {m}
                        </li>
                      ))}
                    </ul>
                    {profile.not_teaches.length > 0 && (
                      <p className="mt-4 rounded-xl bg-[#F8FAFC] px-3 py-2.5 text-[12px] text-[#64748B] ring-1 ring-[#E2E8F0]">
                        لا يُدرّس: {profile.not_teaches.join('، ')}
                      </p>
                    )}
                  </section>
                )}
              </div>
            )}

            {/* schedule + reviews */}
            <div className={`grid gap-6 ${rated ? 'md:grid-cols-2' : ''}`}>
              <section id="schedule" className={`scroll-mt-32 p-5 ${CARD}`}>
                <CardTitle>المواعيد المتاحة</CardTitle>
                {availability.length === 0 ? (
                  <p className="rounded-xl bg-[#F8FAFC] px-4 py-5 text-center text-[13px] text-[#64748B] ring-1 ring-[#E2E8F0]">
                    تُنسَّق المواعيد مع الفريق حسب وقتك — تواصل معنا لنجد الوقت المناسب.
                  </p>
                ) : (
                  <>
                    <div className="overflow-hidden rounded-xl ring-1 ring-[#E2E8F0]">
                      {WEEK.map((d, i) => {
                        const w = availability.filter(a => a.day === d.n).sort((a, b) => a.from.localeCompare(b.from))
                        return (
                          <div key={d.n} className={`flex items-center justify-between gap-3 px-3.5 py-2.5 text-[12.5px] ${i % 2 ? 'bg-white' : 'bg-[#F8FAFC]'}`}>
                            <span className="font-bold text-[#1E3A8A]">{d.label}</span>
                            {w.length
                              ? <span className="font-semibold tabular-nums text-[#334155]" dir="ltr">{w.map(x => `${x.from} – ${x.to}`).join('  ·  ')}</span>
                              : <span className="text-[#94A3B8]">غير متاح</span>}
                          </div>
                        )
                      })}
                    </div>
                    <p className="mt-3 flex items-center gap-1.5 text-[11.5px] font-semibold text-[#64748B]">
                      <Clock size={13} className="text-blue-600" /> الأوقات بتوقيت المغرب، ويمكن الاتفاق على غيرها مع الفريق.
                    </p>
                  </>
                )}
              </section>

              {rated && (
                <section id="reviews" className={`scroll-mt-32 p-5 ${CARD}`}>
                  <CardTitle>ماذا يقول الطلاب</CardTitle>
                  <div className="flex items-center gap-4 rounded-xl bg-[#F8FAFC] p-3.5 ring-1 ring-[#E2E8F0]">
                    <div className="text-center">
                      <div className="text-[30px] font-extrabold leading-none tabular-nums text-[#1E3A8A]">{stats.rating_avg.toFixed(1)}</div>
                      <div className="mt-1"><Stars value={stats.rating_avg} size={11} /></div>
                    </div>
                    {breakdownTotal > 0 && (
                      <div className="flex-1 space-y-1">
                        {[5, 4, 3, 2, 1].map(n => {
                          const c = teacher.rating_breakdown[String(n)] ?? 0
                          return (
                            <div key={n} className="flex items-center gap-2 text-[11px] font-bold text-[#64748B]">
                              <span className="w-2.5 tabular-nums">{n}</span>
                              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#E2E8F0]">
                                <div className="h-full rounded-full bg-amber-400" style={{ width: `${(c / breakdownTotal) * 100}%` }} />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                  {reviews.length > 0 && (
                    <ul className="mt-4 divide-y divide-[#EEF2F7]">
                      {reviews.slice(0, 4).map((r, i) => (
                        <li key={i} className="flex gap-3 py-3.5 last:pb-0">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700">
                            <UserRound size={16} />
                          </span>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[12.5px] font-bold text-[#1E3A8A]">طالب</span>
                              <Stars value={r.rating} size={11} />
                              <span className="text-[11px] text-[#94A3B8]">{ago(r.created_at)}</span>
                            </div>
                            <p className="mt-1 text-[13px] leading-relaxed text-[#475569]">{r.comment}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}
            </div>
          </div>

          {/* sticky booking card */}
          <aside className="lg:col-span-4">
            <div className={`p-5 sm:p-6 lg:sticky lg:top-24 ${CARD}`}>
              <h2 className="text-[20px] font-extrabold tracking-tight text-[#1E3A8A]">ابدأ مع {first}</h2>
              <p className="mt-1 text-[13px] text-[#64748B]">نرتّب معك أول حصة عبر واتساب.</p>
              <ul className="mt-5 space-y-3">
                {['تعرّف على أستاذك', 'نحدد مستواك وهدفك', 'خطة تعلّم شخصية', 'فردي أو ضمن مجموعة، أونلاين'].map(t => (
                  <li key={t} className="flex items-center gap-2.5 text-[13.5px] font-semibold text-[#334155]">
                    <CheckCircle2 size={17} className="shrink-0 text-blue-600" /> {t}
                  </li>
                ))}
              </ul>
              <div className="my-5 h-px bg-[#EEF2F7]" />
              {rated && (
                <div className="mb-4 flex items-center gap-2">
                  <Stars value={stats.rating_avg} size={15} />
                  <span className="text-[13px] font-bold text-[#1E3A8A]">{stats.rating_avg.toFixed(1)}</span>
                  <span className="text-[12px] text-[#64748B]">· {fmt(stats.classes_done)} حصة منجزة</span>
                </div>
              )}
              <a href={wa} target="_blank" rel="noopener noreferrer" className={`${gold} w-full py-3.5`}>
                <MessageCircle size={17} /> تواصل عبر واتساب
              </a>
              <ShareProfileButton title={name} label="مشاركة الملف" className={`${outline} mt-2 w-full`} />
              <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-[#F8FAFC] px-3.5 py-3 ring-1 ring-[#E2E8F0]">
                <ShieldCheck size={18} className="shrink-0 text-blue-600" />
                <span className="text-[12px] text-[#64748B]">معلوماتك تبقى خاصة ولا تُشارك مع أي جهة.</span>
              </div>
            </div>
          </aside>
        </div>

        {/* ══ Closing banner ══ */}
        <section className="relative mt-10 overflow-hidden rounded-[28px] bg-gradient-to-l from-blue-600 via-blue-700 to-blue-900 px-6 py-7 text-white sm:px-10">
          <div aria-hidden className="pointer-events-none absolute -top-20 left-1/4 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(251,191,36,.25),transparent_65%)]" />
          <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:text-right">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
              <Sparkles size={28} className="text-amber-300" />
            </span>
            <div className="flex-1">
              <h2 className="text-[20px] font-extrabold text-white sm:text-[22px]">جاهز تبدأ رحلتك مع الإنجليزية؟</h2>
              <p className="mt-1 text-[13.5px] text-blue-100">تواصل معنا اليوم وابدأ مع {first} خطوتك الأولى نحو الطلاقة.</p>
            </div>
            <a href={wa} target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-[14px] font-extrabold text-blue-800 shadow-lg transition hover:bg-blue-50">
              <CalendarDays size={17} /> ابدأ مع {first}
            </a>
          </div>
        </section>
      </div>

      {/* ══ Phone CTA bar ══ */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#E2E8F0] bg-white/95 px-4 py-3 backdrop-blur-xl lg:hidden
                      pb-[max(.75rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14px] font-extrabold text-[#1E3A8A]">{name}</div>
            {rated && <div className="flex items-center gap-1 text-[11.5px] font-bold text-[#64748B]"><Star size={11} className="text-amber-400" fill="currentColor" /> {stats.rating_avg.toFixed(1)} ({stats.rating_count})</div>}
          </div>
          <a href={wa} target="_blank" rel="noopener noreferrer" className={gold}>
            <MessageCircle size={16} /> تواصل الآن
          </a>
        </div>
      </div>
    </main>
  )
}
