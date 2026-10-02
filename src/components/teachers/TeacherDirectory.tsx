'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, Star, Users } from 'lucide-react'
import type { PublicTeacherCard } from '@/lib/teacher-public'

export default function TeacherDirectory({ teachers }: { teachers: PublicTeacherCard[] }) {
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
      </div>
    </main>
  )
}