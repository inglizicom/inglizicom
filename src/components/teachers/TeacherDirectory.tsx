'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, Crown, Medal, Search, Sparkles, Star, Trophy, Users } from 'lucide-react'
import type { PublicLeaderboardRow, PublicTeacherCard } from '@/lib/teacher-public'
import { profileHref } from './previewTeachers'

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

/** The public leaderboard at the foot of the directory — who leads this month, and a way into every profile.
 *  Built to catch the eye: a blue stage with gold light, a raised winner with a turning gold ring and a
 *  floating crown, medals, and rows that rise into view. Every looping motion stops for visitors who ask
 *  their system for reduced motion. */
function PublicLeaderboard({ rows }: { rows: PublicLeaderboardRow[] }) {
  const calm = useReducedMotion()
  const live = rows.reduce((a, r) => a + r.live, 0)
  const top = rows.slice(0, 3)
  // Podium order on wide screens: 2 · 1 · 3, so the winner stands in the middle.
  const podium = top.length === 3 ? [top[1], top[0], top[2]] : top
  const EMOJI = ['🥇', '🥈', '🥉']

  return (
    <section id="leaderboard" aria-label="لوحة الشرف"
             className="relative mx-auto mt-10 max-w-3xl scroll-mt-6 overflow-hidden rounded-[22px] bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 px-3 py-4 text-white shadow-[0_24px_56px_-22px_rgba(30,58,138,.75)] sm:px-5">
      {/* gold and white light */}
      <motion.div aria-hidden className="pointer-events-none absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(251,191,36,.35),transparent_65%)]"
                  animate={calm ? undefined : { scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />
      <div aria-hidden className="pointer-events-none absolute -bottom-28 -right-16 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.12),transparent_65%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:18px_18px]" />

      {/* heading */}
      <div className="relative mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-1.5 text-base font-black text-white sm:text-lg">
            <motion.span className="inline-block"
                         animate={calm ? undefined : { rotate: [0, -12, 12, -6, 0], y: [0, -3, 0] }}
                         transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 2.5 }}>🏆</motion.span>
            أفضل الأساتذة هذا الشهر
          </h2>
          <p className="text-[11px] text-blue-100"><Sparkles size={11} className="inline -mt-0.5 text-amber-300" /> لوحة الشرف · حسب الحصص، الطلاب والتقييمات</p>
        </div>
        {live > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-400/15 px-2.5 py-1 text-[11px] font-bold text-emerald-200 ring-1 ring-emerald-300/30">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            🔥 {live} طالب يدرس الآن
          </span>
        )}
      </div>

      {/* podium */}
      <div className={`relative grid items-end gap-2 ${top.length === 3 ? 'sm:grid-cols-3' : 'sm:flex sm:justify-center'}`}>
        {podium.map((r, idx) => {
          const place = top.indexOf(r)          // 0 = winner
          const first = place === 0
          return (
            <motion.div key={r.id}
                        initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.55, delay: 0.1 + idx * 0.12, ease: [0.22, 1, 0.36, 1] }}
                        className={`w-full ${first && top.length === 3 ? 'sm:pb-2.5' : ''} ${top.length < 3 ? 'sm:w-48' : ''}`}>
              <Link href={profileHref(r.id)}
                    className={`group relative block overflow-hidden rounded-[16px] bg-white px-2.5 pb-2.5 pt-4 text-center text-[#1E3A8A] transition duration-300
                                hover:-translate-y-1.5 ${first
                                  ? 'shadow-[0_0_0_2px_rgba(251,191,36,.9),0_24px_50px_-14px_rgba(251,191,36,.55)] hover:shadow-[0_0_0_2px_rgba(251,191,36,1),0_30px_60px_-12px_rgba(251,191,36,.7)]'
                                  : 'shadow-[0_18px_40px_-16px_rgba(15,23,42,.55)] hover:shadow-[0_26px_50px_-14px_rgba(15,23,42,.65)]'}`}>
                {first && (
                  <motion.span aria-hidden className="absolute top-0 left-1/2 -translate-x-1/2 text-[17px] drop-shadow-md"
                               animate={calm ? undefined : { y: [0, -5, 0], rotate: [-6, 6, -6] }}
                               transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}>👑</motion.span>
                )}
                <div className="relative mx-auto w-fit">
                  {first && (
                    <motion.span aria-hidden
                                 className="absolute -inset-[5px] rounded-full bg-[conic-gradient(from_0deg,#FDE68A,#F59E0B,#FBBF24,#FFFBEB,#F59E0B,#FDE68A)]"
                                 animate={calm ? undefined : { rotate: 360 }}
                                 transition={{ duration: 6, repeat: Infinity, ease: 'linear' }} />
                  )}
                  <span className={`relative block rounded-full p-[3px] ${first ? 'bg-white' : `bg-gradient-to-br ${MEDAL[place].ring}`}`}>
                    <span className="block rounded-full ring-2 ring-white"><Face name={r.name} url={r.avatar_url} size={first ? 46 : 40} /></span>
                  </span>
                  <span className="absolute -bottom-1 -left-1.5 text-[15px] drop-shadow">{EMOJI[place]}</span>
                </div>
                                <h3 className="mt-1.5 truncate text-[13px] font-black text-[#1E3A8A]">{r.name}</h3>
                <div className="mt-1 flex items-center justify-center gap-2 text-[10.5px] font-bold text-[#475569]">
                  <span>⭐ {r.rating_count ? r.rating_avg.toFixed(1) : '—'}</span>
                  <span>👥 {r.students}</span>
                  {r.live > 0 && <span className="text-emerald-700">🔥 {r.live}</span>}
                </div>
                <div className={`mt-0.5 text-[15px] font-black tabular-nums ${first ? 'bg-gradient-to-l from-amber-500 to-yellow-600 bg-clip-text text-transparent' : 'text-[#1E3A8A]'}`}>
                  {r.score} <span className="text-[10px] font-bold text-[#94A3B8]">نقطة</span>
                </div>
                {r.is_top_rated && (
                  <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-gradient-to-l from-amber-400 to-yellow-500 px-1.5 py-px text-[9.5px] font-extrabold text-blue-900 shadow-sm shadow-amber-500/40">
                    <Crown size={10} /> الأفضل تقييماً
                  </div>
                )}
                <div className="mt-1.5 flex items-center justify-center gap-1 rounded-lg bg-blue-50 py-1 text-[11px] font-bold text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white">
                  الملف <ArrowLeft size={12} className="transition group-hover:-translate-x-0.5" />
                </div>
                {first && !calm && (
                  /* a light sweep across the winner's card */
                  <motion.span aria-hidden className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-l from-transparent via-white/60 to-transparent"
                               initial={{ x: '-150%' }} animate={{ x: '350%' }}
                               transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 3.5, ease: 'easeInOut' }} />
                )}
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* full ranking */}
      <ol className="relative mt-2.5 overflow-hidden rounded-[16px] bg-white text-[#1E3A8A] shadow-[0_20px_44px_-18px_rgba(15,23,42,.6)]">
        {rows.slice(0, 8).map((r, i) => (
          <motion.li key={r.id} className="border-b border-[#EEF2F7] last:border-0"
                     initial={{ opacity: 0, x: 18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                     transition={{ duration: 0.4, delay: Math.min(i, 8) * 0.05 }}>
            <Link href={profileHref(r.id)}
                  className={`group flex items-center gap-2.5 px-3 py-1.5 transition duration-200 hover:bg-blue-50/70 ${r.rank === 1 ? 'bg-amber-50/60' : ''}`}>
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-black shadow-sm
                                ${r.rank === 1 ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-blue-900 shadow-amber-500/40'
                                  : r.rank <= 3 ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-blue-700/30' : 'bg-[#F1F5F9] text-[#64748B]'}`}>
                {r.rank <= 3 ? EMOJI[r.rank - 1] : r.rank}
              </span>
              <span className="rounded-full ring-2 ring-white shadow-md"><Face name={r.name} url={r.avatar_url} size={26} /></span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-[12.5px] font-black">{r.name}</span>
                  {r.is_top_rated && <Crown size={14} className="shrink-0 text-amber-500" aria-label="من الأفضل تقييماً" />}
                </div>
                <div className="flex flex-wrap items-center gap-x-2.5 text-[10.5px] text-[#64748B]">
                  <span>⭐ {r.rating_count ? <>{r.rating_avg.toFixed(1)} <span>({r.rating_count})</span></> : 'بدون تقييم بعد'}</span>
                  <span>👥 {r.students} طالب</span>
                  {r.live > 0 && <span className="font-bold text-emerald-700">🔥 {r.live} الآن</span>}
                  <span className="hidden sm:inline">📅 {r.sessions_month} حصة</span>
                </div>
              </div>
              <div className="hidden text-center sm:block">
                <div className="text-[12px] font-black tabular-nums">⚡ {r.score}</div>
              </div>
              <span className="inline-flex shrink-0 items-center gap-0.5 rounded-md bg-blue-50 px-2 py-1 text-[10.5px] font-bold text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white">
                الملف <ArrowLeft size={11} className="transition group-hover:-translate-x-0.5" />
              </span>
            </Link>
          </motion.li>
        ))}
      </ol>
      <p className="relative mt-2 text-center text-[10px] text-blue-100/90">
        ⚡ النقاط: 10 لكل حصة منجزة هذا الشهر · 5 لكل طالب حالي · التقييم × 20 بعد 3 تقييمات · 👑 «الأفضل تقييماً»: 4.5 فأكثر من 5 تقييمات.
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
    <main dir="rtl" className="min-h-screen overflow-x-clip bg-[#F4F7FC] text-[#1E3A8A]">
      <header className="border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="text-lg font-black">إنجليزي<span className="text-[#B45309]">.</span>كوم</Link>
          <Link href="/teacher/login" className="text-sm font-bold text-[#475569] hover:text-[#1E3A8A]">دخول الأساتذة</Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <section className="grid grid-cols-1 gap-5 border-b border-[#E2E8F0] py-10 sm:py-14 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-sm font-bold text-[#B45309]">مدرّسون معتمدون من إنجليزي.كوم</p>
            <h1 className="text-inherit mt-2 text-4xl font-black leading-tight sm:text-5xl">اختر أستاذك</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#64748B]">تعرّف على خبرة كل أستاذ، مستوياته وتخصصاته قبل أن تتواصل معنا.</p>
          </div>
          <Link href="/teacher-showcase/demo" className="inline-flex items-center gap-2 text-sm font-bold text-[#B45309] underline underline-offset-4">
            معاينة صفحة أستاذ <ArrowLeft size={15} />
          </Link>
        </section>

        <section aria-label="البحث والتصفية" className="mt-6 grid grid-cols-1 gap-3 rounded-[20px] bg-white p-3 ring-1 ring-[#D6DFEC] shadow-[0_1px_3px_rgba(30,58,138,.10),0_12px_32px_-12px_rgba(30,58,138,.22)] sm:grid-cols-[minmax(260px,1fr)_200px_240px] sm:p-4">
          <label className="relative block">
            <Search size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="ابحث بالاسم أو التخصص"
              className="w-full rounded-xl border border-[#CBD5E1] bg-white py-3.5 pr-12 pl-4 text-base outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
          </label>
          <select value={level} onChange={e => setLevel(e.target.value)} aria-label="المستوى"
            className="w-full rounded-xl border border-[#CBD5E1] bg-white px-4 py-3.5 text-base outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
            <option value="">كل المستويات</option>
            {levels.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
          <select value={specialty} onChange={e => setSpecialty(e.target.value)} aria-label="التخصص"
            className="w-full rounded-xl border border-[#CBD5E1] bg-white px-4 py-3.5 text-base outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
            <option value="">كل التخصصات</option>
            {specialties.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </section>

        <div className="flex items-center justify-between py-5 text-sm font-semibold text-[#64748B]">
          <span>{visible.length} أستاذ</span>
          {(query || level || specialty) && (
            <button onClick={() => { setQuery(''); setLevel(''); setSpecialty('') }} className="underline underline-offset-4">مسح التصفية</button>
          )}
        </div>

        {visible.length ? (
          <div className="divide-y divide-[#E2E8F0] border-y border-[#E2E8F0]">
            {visible.map(t => (
              <article key={t.id} className="grid grid-cols-1 gap-5 py-7 sm:grid-cols-[120px_minmax(0,1fr)_auto] sm:items-center">
                <div className="h-[120px] w-[120px] overflow-hidden rounded-2xl bg-[#E2E8F0] shadow-md">
                  {t.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.avatar_url} alt={t.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl font-black text-[#1E3A8A]">{t.name.slice(0, 1)}</div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h2 className="text-inherit text-2xl font-black">{t.name}</h2>
                    {t.rating_count > 0 && <span className="inline-flex items-center gap-1 text-sm font-bold text-[#B45309]"><Star size={16} fill="currentColor" /> {t.rating_avg.toFixed(1)} <span className="font-medium text-[#64748B]">({t.rating_count})</span></span>}
                  </div>
                  {(t.tagline || t.headline) && <p className="mt-1.5 text-base text-[#475569]">{t.tagline || t.headline}</p>}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {t.specialties.slice(0, 3).map(x => <span key={x} className="rounded-lg bg-[#EEF2F7] px-2.5 py-1.5 text-[13px] font-semibold text-[#475569]">{x}</span>)}
                    {t.levels.slice(0, 4).map(x => <span key={x} className="rounded-lg border border-[#CBD5E1] px-2.5 py-1.5 text-[13px] font-bold text-[#475569]">{x}</span>)}
                  </div>
                  {t.years_experience != null && <p className="mt-2.5 text-sm text-[#64748B]">{t.years_experience} سنوات خبرة</p>}
                </div>
                <Link href={profileHref(t.id)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-blue-600 to-blue-800 px-6 py-3.5 text-base font-bold text-white shadow-md shadow-blue-700/25 hover:from-blue-500 hover:to-blue-700">
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