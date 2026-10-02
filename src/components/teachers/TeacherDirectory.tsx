'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CalendarCheck, Crown, Medal, Radio, Search, Star, Trophy, Users } from 'lucide-react'
import type { PublicLeaderboardRow, PublicTeacherCard } from '@/lib/teacher-public'

const MEDAL = [
  { ring: 'from-amber-300 to-yellow-500', chip: 'bg-amber-50 text-amber-800 ring-amber-200', label: 'المركز الأول' },
  { ring: 'from-slate-200 to-slate-400', chip: 'bg-slate-50 text-slate-700 ring-slate-200', label: 'المركز الثاني' },
  { ring: 'from-orange-300 to-amber-700', chip: 'bg-orange-50 text-orange-800 ring-orange-200', label: 'المركز الثالث' },
]

function Face({ name, url, size }: { name: string; url: string | null; size: number }) {
  return url
    ? /* eslint-disable-next-line @next/next/no-img-element */
      <img src={url} alt={name} style={{ width: size, height: size }} className="rounded-full object-cover" />
    : <span style={{ width: size, height: size, fontSize: size * 0.38 }}
            className="rounded-full bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 font-black flex items-center justify-center">
        {name.slice(0, 1)}
      </span>
}

/** The public leaderboard at the foot of the directory — who leads this month, and a way into every profile. */
function PublicLeaderboard({ rows }: { rows: PublicLeaderboardRow[] }) {
  const live = rows.reduce((a, r) => a + r.live, 0)
  return (
    <section id="leaderboard" aria-label="لوحة الشرف" className="mt-14 scroll-mt-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700"><Trophy size={14} /> لوحة الشرف</p>
          <h2 className="text-inherit mt-1 text-2xl font-black sm:text-3xl">أفضل الأساتذة هذا الشهر</h2>
          <p className="mt-1 text-sm text-[#64748B]">ترتيب شفاف حسب الحصص المنجزة، عدد الطلاب وتقييماتهم.</p>
        </div>
        {live > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> {live} طالب يدرس الآن
          </span>
        )}
      </div>

      {/* podium */}
      <div className="grid gap-4 sm:grid-cols-3">
        {rows.slice(0, 3).map((r, i) => (
          <Link key={r.id} href={`/teacher-showcase/${r.id}`}
                className="group rounded-[24px] bg-white p-5 text-center ring-1 ring-[#D6DFEC] shadow-[0_1px_3px_rgba(30,58,138,.10),0_12px_32px_-10px_rgba(30,58,138,.26)] transition hover:-translate-y-0.5 hover:ring-blue-300">
            <div className={`mx-auto w-fit rounded-full bg-gradient-to-br ${MEDAL[i].ring} p-1 shadow-md`}>
              <span className="block rounded-full ring-4 ring-white"><Face name={r.name} url={r.avatar_url} size={76} /></span>
            </div>
            <span className={`mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-extrabold ring-1 ${MEDAL[i].chip}`}>
              {i === 0 ? <Trophy size={12} /> : <Medal size={12} />} {MEDAL[i].label}
            </span>
            <h3 className="text-inherit mt-2 truncate text-lg font-black">{r.name}</h3>
            <p className="truncate text-xs text-[#64748B]">{r.headline ?? 'أستاذ في إنجليزي.كوم'}</p>
            <div className="mt-3 flex items-center justify-center gap-3 text-xs font-bold text-[#475569]">
              <span className="inline-flex items-center gap-1"><Star size={13} className="text-amber-400" fill="currentColor" />{r.rating_count ? r.rating_avg.toFixed(1) : '—'}</span>
              <span className="inline-flex items-center gap-1"><Users size={13} className="text-blue-600" />{r.students} طالب</span>
              {r.live > 0 && <span className="inline-flex items-center gap-1 text-emerald-700"><Radio size={13} />{r.live}</span>}
            </div>
            {r.is_top_rated && (
              <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-l from-amber-400 to-yellow-500 px-2.5 py-1 text-[11px] font-extrabold text-blue-900">
                <Crown size={12} /> من الأفضل تقييماً
              </div>
            )}
            <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 group-hover:text-blue-900">
              عرض الملف <ArrowLeft size={15} />
            </div>
          </Link>
        ))}
      </div>

      {/* full ranking */}
      <ol className="mt-5 overflow-hidden rounded-[24px] bg-white ring-1 ring-[#D6DFEC] shadow-[0_1px_3px_rgba(30,58,138,.10),0_12px_32px_-10px_rgba(30,58,138,.26)]">
        {rows.map(r => (
          <li key={r.id} className="border-b border-[#EEF2F7] last:border-0">
            <Link href={`/teacher-showcase/${r.id}`} className="group flex items-center gap-3 px-4 py-3.5 transition hover:bg-[#F8FAFC] sm:gap-4 sm:px-5">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black
                                ${r.rank === 1 ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-blue-900'
                                  : r.rank <= 3 ? 'bg-blue-100 text-blue-700' : 'bg-[#F1F5F9] text-[#64748B]'}`}>{r.rank}</span>
              <Face name={r.name} url={r.avatar_url} size={42} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate font-black">{r.name}</span>
                  {r.is_top_rated && <Crown size={14} className="shrink-0 text-amber-500" aria-label="من الأفضل تقييماً" />}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[#64748B]">
                  <span className="inline-flex items-center gap-1"><Star size={12} className="text-amber-400" fill="currentColor" />
                    {r.rating_count ? <>{r.rating_avg.toFixed(1)} <span>({r.rating_count})</span></> : 'بدون تقييم بعد'}</span>
                  <span className="inline-flex items-center gap-1"><Users size={12} className="text-blue-600" /> {r.students} طالب حالي</span>
                  {r.live > 0 && <span className="inline-flex items-center gap-1 font-bold text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {r.live} يدرس الآن</span>}
                  <span className="hidden sm:inline-flex items-center gap-1"><CalendarCheck size={12} className="text-indigo-600" /> {r.sessions_month} حصة هذا الشهر</span>
                </div>
              </div>
              <div className="hidden text-center sm:block">
                <div className="text-lg font-black tabular-nums">{r.score}</div>
                <div className="text-[11px] font-semibold text-[#94A3B8]">نقطة</div>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 group-hover:bg-blue-100">
                الملف <ArrowLeft size={13} />
              </span>
            </Link>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-center text-xs text-[#94A3B8]">
        النقاط: 10 لكل حصة منجزة هذا الشهر · 5 لكل طالب حالي · التقييم × 20 بعد 3 تقييمات · «الأفضل تقييماً»: 4.5 فأكثر من 5 تقييمات.
      </p>
    </section>
  )
}

export default function TeacherDirectory({ teachers, leaderboard = [] }: { teachers: PublicTeacherCard[]; leaderboard?: PublicLeaderboardRow[] }) {
  const [query, setQuery] = useState('')
  const [level, setLevel] = useState('')
  const [specialty, setSpecialty] = useState('')

  const levels = useMemo(() => [...new Set(teachers.flatMap(t => t.levels))].sort(), [teachers])
  const specialties = useMemo(() => [...new Set(teachers.flatMap(t => t.specialties))].sort((a, b) => a.localeCompare(b, 'ar')), [teachers])
  const visible = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('ar')
    return teachers.filter(t => {
      const text = [t.name, t.headline, t.tagline, ...t.specialties].filter(Boolean).join(' ').toLocaleLowerCase('ar')
      return (!q || text.includes(q)) && (!level || t.levels.includes(level)) && (!specialty || t.specialties.includes(specialty))
    })
  }, [teachers, query, level, specialty])

  return (
    <main dir="rtl" className="min-h-screen bg-[#F4F7FC] text-[#1E3A8A]">
      <header className="border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="text-lg font-black">إنجليزي<span className="text-[#B45309]">.</span>كوم</Link>
          <Link href="/teacher/login" className="text-sm font-bold text-[#475569] hover:text-[#1E3A8A]">دخول الأساتذة</Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <section className="grid gap-5 border-b border-[#E2E8F0] py-8 sm:py-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-bold text-[#B45309]">مدرّسون معتمدون من إنجليزي.كوم</p>
            <h1 className="text-inherit mt-2 text-3xl font-black leading-tight sm:text-4xl">اختر أستاذك</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748B]">تعرّف على خبرة كل أستاذ، مستوياته وتخصصاته قبل أن تتواصل معنا.</p>
          </div>
          <Link href="/teacher-showcase/demo" className="inline-flex items-center gap-2 text-sm font-bold text-[#B45309] underline underline-offset-4">
            معاينة صفحة أستاذ <ArrowLeft size={15} />
          </Link>
        </section>

        <section aria-label="البحث والتصفية" className="grid gap-2 border-b border-[#E2E8F0] py-4 sm:grid-cols-[minmax(220px,1fr)_180px_220px]">
          <label className="relative block">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="ابحث بالاسم أو التخصص"
              className="w-full rounded-md border border-[#CBD5E1] bg-white py-2.5 pr-9 pl-3 text-sm outline-none focus:border-[#B45309]" />
          </label>
          <select value={level} onChange={e => setLevel(e.target.value)} aria-label="المستوى"
            className="w-full rounded-md border border-[#CBD5E1] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#B45309]">
            <option value="">كل المستويات</option>
            {levels.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
          <select value={specialty} onChange={e => setSpecialty(e.target.value)} aria-label="التخصص"
            className="w-full rounded-md border border-[#CBD5E1] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#B45309]">
            <option value="">كل التخصصات</option>
            {specialties.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </section>

        <div className="flex items-center justify-between py-4 text-xs font-semibold text-[#64748B]">
          <span>{visible.length} أستاذ</span>
          {(query || level || specialty) && (
            <button onClick={() => { setQuery(''); setLevel(''); setSpecialty('') }} className="underline underline-offset-4">مسح التصفية</button>
          )}
        </div>

        {visible.length ? (
          <div className="divide-y divide-[#E2E8F0] border-y border-[#E2E8F0]">
            {visible.map(t => (
              <article key={t.id} className="grid gap-4 py-5 sm:grid-cols-[88px_minmax(0,1fr)_auto] sm:items-center">
                <div className="h-[88px] w-[88px] overflow-hidden rounded-md bg-[#E2E8F0]">
                  {t.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.avatar_url} alt={t.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-3xl font-black text-[#1E3A8A]">{t.name.slice(0, 1)}</div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h2 className="text-inherit text-lg font-black">{t.name}</h2>
                    {t.rating_count > 0 && <span className="inline-flex items-center gap-1 text-xs font-bold text-[#B45309]"><Star size={13} fill="currentColor" /> {t.rating_avg.toFixed(1)} <span className="font-medium text-[#64748B]">({t.rating_count})</span></span>}
                  </div>
                  {(t.tagline || t.headline) && <p className="mt-1 text-sm text-[#475569]">{t.tagline || t.headline}</p>}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {t.specialties.slice(0, 3).map(x => <span key={x} className="rounded-sm bg-[#EEF2F7] px-2 py-1 text-[11px] font-semibold text-[#475569]">{x}</span>)}
                    {t.levels.slice(0, 4).map(x => <span key={x} className="rounded-sm border border-[#CBD5E1] px-2 py-1 text-[11px] font-bold text-[#475569]">{x}</span>)}
                  </div>
                  {t.years_experience != null && <p className="mt-2 text-xs text-[#64748B]">{t.years_experience} سنوات خبرة</p>}
                </div>
                <Link href={`/teacher-showcase/${t.id}`} className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-l from-blue-600 to-blue-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-[#1E3A8A]">
                  عرض الملف <ArrowLeft size={15} />
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="border-y border-[#E2E8F0] py-16 text-center">
            <Users size={24} className="mx-auto text-[#94A3B8]" />
            <p className="mt-3 text-sm font-bold">لا يوجد أساتذة مطابقون</p>
            <p className="mt-1 text-xs text-[#64748B]">غيّر البحث أو امسح التصفية لعرض الجميع.</p>
          </div>
        )}

        {leaderboard.length > 0 && <PublicLeaderboard rows={leaderboard} />}
      </div>
    </main>
  )
}