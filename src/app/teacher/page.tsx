'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Users, CalendarDays, Clock, Star, AlertTriangle, Video,
  ArrowLeft, Loader2, CalendarPlus, ClipboardList,
} from 'lucide-react'
import { useTeacher } from '@/lib/teacher-context'
import {
  fetchTeacherOverview, fetchUpcoming, fetchReportsOwed,
  type TeacherOverview, type ClassSession,
} from '@/lib/teachers'
import { Card, StatTile, SectionTitle, Empty, Pill, fmtDateTime, fromNow, STATUS_AR } from './_ui'

export default function TeacherDashboard() {
  const teacher = useTeacher()
  const [ov,       setOv]       = useState<TeacherOverview | null>(null)
  const [upcoming, setUpcoming] = useState<ClassSession[]>([])
  const [owed,     setOwed]     = useState<ClassSession[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const [o, u, r] = await Promise.all([
        fetchTeacherOverview(),
        fetchUpcoming(teacher.id, 4),
        fetchReportsOwed(teacher.id),
      ])
      if (!alive) return
      setOv(o); setUpcoming(u); setOwed(r); setLoading(false)
    })()
    return () => { alive = false }
  }, [teacher.id])

  const name = (teacher.profile?.display_name || teacher.fullName || '').split(' ')[0]
  const next = upcoming[0]

  if (loading) {
    return (
      <div className="py-32 flex items-center justify-center text-stone-400 gap-2">
        <Loader2 size={18} className="animate-spin" /><span className="text-sm font-bold">جاري التحميل…</span>
      </div>
    )
  }

  return (
    <div className="space-y-7">

      {/* Greeting */}
      <div>
        <h1 className="text-[26px] sm:text-[30px] font-black tracking-tight">
          {name ? `أهلاً ${name}` : 'أهلاً بك'}
        </h1>
        <p className="text-stone-500 text-sm font-semibold mt-0.5">
          {new Date().toLocaleDateString('ar-MA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Reports owed — the one thing that should nag */}
      {owed.length > 0 && (
        <Link href="/teacher/reports" className="block">
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 flex items-center gap-3.5 hover:bg-red-100/70 transition">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <AlertTriangle size={19} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-black text-red-800 text-[15px]">
                {owed.length} {owed.length === 1 ? 'حصة بدون تقرير' : 'حصص بدون تقارير'}
              </div>
              <div className="text-[12.5px] text-red-600/90 font-semibold">
                كل حصة منتهية تحتاج تقريراً — اكتبه الآن قبل أن تنسى التفاصيل.
              </div>
            </div>
            <ArrowLeft size={18} className="text-red-400 shrink-0" />
          </div>
        </Link>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile icon={Users}        label="طلابي"            value={ov?.students_total ?? 0} />
        <StatTile icon={CalendarDays} label="حصص هذا الشهر"    value={ov?.classes_month ?? 0}
                  sub={ov?.upcoming ? `${ov.upcoming} قادمة` : undefined} />
        <StatTile icon={Clock}        label="ساعات التدريس"    value={ov?.hours_month ?? 0} sub="هذا الشهر" />
        <StatTile icon={Star}         label="تقييمي"           tone="amber"
                  value={ov?.rating_count ? Number(ov.rating_avg ?? 0).toFixed(1) : '—'}
                  sub={ov?.rating_count ? `${ov.rating_count} تقييم` : 'لا تقييمات بعد'} />
      </div>

      {/* Next class */}
      <div>
        <SectionTitle action={
          <Link href="/teacher/classes" className="text-[13px] font-bold text-amber-700 hover:text-amber-800">
            كل الحصص
          </Link>
        }>
          الحصة القادمة
        </SectionTitle>

        {next ? (
          <Card className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start gap-4">
              <div className="flex-1 min-w-[16rem]">
                <div className="flex items-center gap-2 mb-2">
                  <Pill tone={next.status === 'live' ? 'live' : 'scheduled'}>{STATUS_AR[next.status]}</Pill>
                  <Pill tone="muted">{STATUS_AR[next.mode]}</Pill>
                  {next.level && <Pill tone="muted">{next.level}</Pill>}
                </div>
                <h3 className="text-xl font-black tracking-tight">{next.title}</h3>
                <p className="text-stone-500 text-[13.5px] font-semibold mt-1">
                  {fmtDateTime(next.starts_at)} · {next.duration_min} دقيقة
                </p>
                <p className="text-amber-700 text-[13px] font-black mt-1">{fromNow(next.starts_at)}</p>
              </div>

              <div className="flex flex-col gap-2 w-full sm:w-auto">
                {next.meeting_url && (
                  <a
                    href={next.meeting_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-stone-900 text-white text-sm font-bold hover:bg-stone-800 transition"
                  >
                    <Video size={17} /> ادخل للحصة
                  </a>
                )}
                <Link
                  href={`/teacher/classes/${next.id}`}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-stone-300 text-stone-700 text-sm font-bold hover:bg-stone-50 transition"
                >
                  الحضور والتقرير
                </Link>
              </div>
            </div>
          </Card>
        ) : (
          <Card>
            <Empty
              icon={CalendarPlus}
              title="لا حصص قادمة"
              hint="أضف حصصك في جدولك حتى يعرف الجميع متى الموعد — ويُحتسب وقت تدريسك."
            />
            <div className="pb-6 text-center">
              <Link href="/teacher/classes" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-bold hover:bg-stone-800 transition">
                <CalendarPlus size={16} /> برمج حصة
              </Link>
            </div>
          </Card>
        )}
      </div>

      {/* Rest of the week */}
      {upcoming.length > 1 && (
        <div>
          <SectionTitle>بعدها</SectionTitle>
          <Card className="divide-y divide-stone-100">
            {upcoming.slice(1).map(s => (
              <Link key={s.id} href={`/teacher/classes/${s.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-stone-50 transition">
                <div className="w-12 text-center shrink-0">
                  <div className="text-[11px] font-bold text-stone-400">
                    {new Date(s.starts_at).toLocaleDateString('ar-MA', { weekday: 'short' })}
                  </div>
                  <div className="text-[15px] font-black tabular-nums">
                    {new Date(s.starts_at).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[14.5px] truncate">{s.title}</div>
                  <div className="text-[12px] text-stone-400 font-semibold">
                    {STATUS_AR[s.mode]} · {s.duration_min} دقيقة
                  </div>
                </div>
                <ArrowLeft size={16} className="text-stone-300 shrink-0" />
              </Link>
            ))}
          </Card>
        </div>
      )}

      {/* Quick lanes */}
      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { href: '/teacher/students',  icon: Users,         title: 'طلابي',        sub: 'التقدّم والحضور' },
          { href: '/teacher/reports',   icon: ClipboardList, title: 'تقارير الدروس', sub: 'ما تم إنجازه' },
          { href: '/teacher/materials', icon: CalendarDays,  title: 'ملفاتي',       sub: 'PDF · Word · صوتيات' },
        ].map(l => (
          <Link key={l.href} href={l.href}>
            <Card className="p-4 flex items-center gap-3 hover:border-amber-300 transition">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <l.icon size={18} />
              </div>
              <div className="min-w-0">
                <div className="font-black text-[14.5px]">{l.title}</div>
                <div className="text-[12px] text-stone-400 font-semibold truncate">{l.sub}</div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
