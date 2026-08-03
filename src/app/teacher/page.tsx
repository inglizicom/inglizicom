'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Users, CalendarDays, Clock, Star, AlertTriangle, Video, Sparkles,
  ArrowLeft, Loader2, CalendarPlus, ClipboardList, FolderOpen, TrendingUp,
} from 'lucide-react'
import { useTeacher } from '@/lib/teacher-context'
import {
  fetchAttendanceTotals, fetchReportsOwed, fetchSessions, fetchTeacherOverview,
  type ClassSession, type TeacherOverview,
} from '@/lib/teachers'
import { AreaTrend, AttendanceBar, BarChart, Ring, Spark, VIZ } from './_charts'
import { Card, Empty, Pill, SectionTitle, fmtDateTime, fromNow, STATUS_AR } from './_ui'

export default function TeacherDashboard() {
  const teacher = useTeacher()
  const [ov,       setOv]       = useState<TeacherOverview | null>(null)
  const [sessions, setSessions] = useState<ClassSession[]>([])
  const [owed,     setOwed]     = useState<ClassSession[]>([])
  const [att,      setAtt]      = useState({ present: 0, late: 0, absent: 0, excused: 0 })
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const [o, s, r, a] = await Promise.all([
        fetchTeacherOverview(),
        fetchSessions(teacher.id),
        fetchReportsOwed(teacher.id),
        fetchAttendanceTotals(teacher.id),
      ])
      if (!alive) return
      setOv(o); setSessions(s); setOwed(r); setAtt(a); setLoading(false)
    })()
    return () => { alive = false }
  }, [teacher.id])

  const now = Date.now()
  const upcoming = useMemo(
    () => sessions
      .filter(s => new Date(s.starts_at).getTime() >= now - 3600_000 && s.status !== 'cancelled')
      .sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at)),
    [sessions, now],
  )

  /** Last 8 weeks of finished classes, oldest → newest. */
  const weekly = useMemo(() => {
    const buckets: { label: string; value: number; hours: number }[] = []
    for (let w = 7; w >= 0; w--) {
      const end   = new Date(); end.setDate(end.getDate() - w * 7); end.setHours(23, 59, 59)
      const start = new Date(end); start.setDate(start.getDate() - 6); start.setHours(0, 0, 0)
      const inWeek = sessions.filter(s => {
        const t = new Date(s.starts_at).getTime()
        return s.status === 'done' && t >= start.getTime() && t <= end.getTime()
      })
      buckets.push({
        label: `${start.getDate()}/${start.getMonth() + 1}`,
        value: inWeek.length,
        hours: Math.round(inWeek.reduce((a, s) => a + s.duration_min, 0) / 6) / 10,
      })
    }
    return buckets
  }, [sessions])

  const name    = (teacher.profile?.display_name || teacher.fullName || '').split(' ')[0]
  const next    = upcoming[0]
  const attRate = ov?.attendance_rate ?? null
  const hasData = sessions.length > 0

  if (loading) {
    return (
      <div className="py-32 flex items-center justify-center text-stone-400 gap-2">
        <Loader2 size={18} className="animate-spin" /><span className="text-sm font-bold">جاري التحميل…</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* ── Hero ─────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-stone-900 via-stone-800 to-stone-900 text-white p-6 sm:p-7">
        <div className="absolute -top-16 -left-10 w-56 h-56 rounded-full bg-amber-400/20 blur-3xl" aria-hidden />
        <div className="absolute -bottom-20 right-10 w-56 h-56 rounded-full bg-emerald-400/10 blur-3xl" aria-hidden />

        <div className="relative flex flex-wrap items-center gap-6">
          <div className="flex-1 min-w-[15rem]">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[11.5px] font-bold text-amber-200 mb-3">
              <Sparkles size={12} />
              {new Date().toLocaleDateString('ar-MA', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
            <h1 className="text-[27px] sm:text-[32px] font-black tracking-tight leading-tight">
              {name ? `أهلاً ${name}` : 'أهلاً بك'} 👋
            </h1>
            <p className="text-stone-300 text-[14px] font-semibold mt-1.5">
              {next
                ? <>حصتك القادمة <span className="text-amber-300 font-black">{fromNow(next.starts_at)}</span> — {next.title}</>
                : 'لا حصص مبرمجة. أضف حصة ليبدأ العدّ.'}
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
              {next?.meeting_url && (
                <a href={next.meeting_url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 text-stone-900 text-[13px] font-black hover:bg-amber-300 transition">
                  <Video size={15} /> ادخل للحصة
                </a>
              )}
              <Link href="/teacher/classes"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white text-[13px] font-bold hover:bg-white/20 transition backdrop-blur">
                <CalendarPlus size={15} /> برمج حصة
              </Link>
            </div>
          </div>

          {attRate != null && (
            <div className="flex items-center gap-5">
              <div className="text-center">
                <Ring pct={attRate} color="#fbbf24" label="حضور" size={96} />
              </div>
              <div className="hidden sm:block space-y-2.5 border-r border-white/10 pr-5">
                <HeroStat value={ov?.students_total ?? 0} label="طالب" />
                <HeroStat value={ov?.hours_month ?? 0}    label="ساعة هذا الشهر" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Reports owed ─────────────────────────────── */}
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
                اكتب التقرير الآن قبل أن تنسى التفاصيل.
              </div>
            </div>
            <ArrowLeft size={18} className="text-red-400 shrink-0" />
          </div>
        </Link>
      )}

      {/* ── Stat tiles ───────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Tile icon={Users} tone="amber" label="طلابي" value={ov?.students_total ?? 0} />
        <Tile icon={CalendarDays} tone="blue" label="حصص هذا الشهر" value={ov?.classes_month ?? 0}
              spark={weekly.map(w => w.value)} sparkColor={VIZ.late} />
        <Tile icon={Clock} tone="green" label="ساعات التدريس" value={ov?.hours_month ?? 0}
              spark={weekly.map(w => w.hours)} sparkColor={VIZ.present} />
        <Tile icon={Star} tone="amber" label="تقييمي"
              value={ov?.rating_count ? Number(ov.rating_avg ?? 0).toFixed(1) : '—'}
              sub={ov?.rating_count ? `${ov.rating_count} تقييم` : 'لا تقييمات بعد'} />
      </div>

      {/* ── Charts ───────────────────────────────────── */}
      {hasData && (
        <div className="grid lg:grid-cols-3 gap-3">
          <Card className="p-5 lg:col-span-2">
            <SectionTitle action={<span className="text-[11.5px] font-bold text-stone-400">آخر 8 أسابيع</span>}>
              الحصص المنتهية
            </SectionTitle>
            <BarChart data={weekly.map(w => ({ label: w.label, value: w.value }))} unit=" حصة" />
          </Card>

          <Card className="p-5">
            <SectionTitle>الحضور</SectionTitle>
            <AttendanceBar present={att.present} late={att.late} absent={att.absent} />
            {att.excused > 0 && (
              <p className="text-[11.5px] font-semibold text-stone-400 mt-3">
                + {att.excused} غياب بعذر، خارج النسبة.
              </p>
            )}
          </Card>

          <Card className="p-5 lg:col-span-3">
            <SectionTitle action={<span className="text-[11.5px] font-bold text-stone-400">ساعات التدريس أسبوعياً</span>}>
              <span className="flex items-center gap-2"><TrendingUp size={16} className="text-amber-600" /> إيقاعك</span>
            </SectionTitle>
            <AreaTrend data={weekly.map(w => ({ label: w.label, value: w.hours }))} unit=" ساعة" />
          </Card>
        </div>
      )}

      {/* ── Next classes ─────────────────────────────── */}
      <div>
        <SectionTitle action={
          <Link href="/teacher/classes" className="text-[13px] font-bold text-amber-700 hover:text-amber-800">كل الحصص</Link>
        }>
          الحصص القادمة
        </SectionTitle>

        {upcoming.length === 0 ? (
          <Card>
            <Empty icon={CalendarPlus} title="لا حصص قادمة"
                   hint="برمج حصصك حتى تُحتسب ساعاتك ويظهر الحضور والتقارير." />
          </Card>
        ) : (
          <Card className="divide-y divide-stone-100">
            {upcoming.slice(0, 5).map((s, i) => (
              <Link key={s.id} href={`/teacher/classes/${s.id}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-amber-50/50 transition group">
                <div className={`w-1.5 h-11 rounded-full shrink-0 ${i === 0 ? 'bg-amber-400' : 'bg-stone-200'}`} />
                <div className="w-14 text-center shrink-0">
                  <div className="text-[10.5px] font-bold text-stone-400">
                    {new Date(s.starts_at).toLocaleDateString('ar-MA', { weekday: 'short' })}
                  </div>
                  <div className="text-[16px] font-black tabular-nums leading-tight">
                    {new Date(s.starts_at).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-[14.5px] truncate">{s.title}</div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <Pill tone={s.status === 'live' ? 'live' : 'scheduled'}>{STATUS_AR[s.status]}</Pill>
                    <Pill tone="muted">{STATUS_AR[s.mode]}</Pill>
                    {s.level && <Pill tone="muted">{s.level}</Pill>}
                    <span className="text-[11.5px] font-bold text-stone-400">{s.duration_min} دقيقة</span>
                  </div>
                </div>
                <ArrowLeft size={16} className="text-stone-300 group-hover:text-amber-500 transition shrink-0" />
              </Link>
            ))}
          </Card>
        )}
      </div>

      {/* ── Quick lanes ──────────────────────────────── */}
      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { href: '/teacher/students',  icon: Users,         title: 'طلابي',         sub: 'التقدّم والحضور',  ring: 'hover:border-amber-300',   bg: 'bg-amber-50 text-amber-700' },
          { href: '/teacher/reports',   icon: ClipboardList, title: 'تقارير الدروس', sub: 'ما تم إنجازه',     ring: 'hover:border-blue-300',    bg: 'bg-blue-50 text-blue-700' },
          { href: '/teacher/materials', icon: FolderOpen,    title: 'ملفاتي',        sub: 'PDF · Word · صوت', ring: 'hover:border-emerald-300', bg: 'bg-emerald-50 text-emerald-700' },
        ].map(l => (
          <Link key={l.href} href={l.href}>
            <Card className={`p-4 flex items-center gap-3 transition ${l.ring}`}>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${l.bg}`}>
                <l.icon size={19} />
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

/* ── Local pieces ────────────────────────────────────── */

function HeroStat({ value, label }: { value: number | string; label: string }) {
  return (
    <div>
      <div className="text-[20px] font-black leading-none tabular-nums">{value}</div>
      <div className="text-[11px] font-bold text-stone-400">{label}</div>
    </div>
  )
}

function Tile({
  icon: Icon, label, value, sub, tone, spark, sparkColor,
}: {
  icon: typeof Users; label: string; value: React.ReactNode; sub?: string
  tone: 'amber' | 'blue' | 'green'
  spark?: number[]; sparkColor?: string
}) {
  const tones = {
    amber: 'bg-amber-100 text-amber-700',
    blue:  'bg-blue-100 text-blue-700',
    green: 'bg-emerald-100 text-emerald-700',
  }
  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-[0_1px_2px_rgba(28,25,23,.04)] p-4 flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tones[tone]}`}>
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <div className="text-[11.5px] font-bold text-stone-400 truncate">{label}</div>
          <div className="text-[23px] font-black leading-tight tabular-nums">{value}</div>
        </div>
      </div>
      {spark && spark.some(v => v > 0)
        ? <Spark data={spark} color={sparkColor} />
        : sub && <div className="text-[11px] text-stone-400 font-semibold truncate">{sub}</div>}
    </div>
  )
}
