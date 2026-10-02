'use client'

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  CalendarCheck, Download, Info, Loader2, RotateCcw, Users, Wallet, X,
} from 'lucide-react'
import { ChartCard, Funnel } from '@/app/sales/_components/Charts'
import DuesBoard from '@/components/DuesBoard'
import RangeControls from '@/components/analytics/RangeControls'
import { DataTable, EnrollmentTrend, RevenueTrend } from '@/components/analytics/TrendCharts'
import {
  COUNTING_RULES, bucketFor, businessToday, deltaPct, describeRange, hasEntityFilters, parseQuery,
  previousRange, toCsv, toQueryString,
  type AnalyticsFilters, type AnalyticsQuery, type AnalyticsView, type CsvCell, type DateRange,
} from '@/lib/enrollment-metrics'
import {
  fetchEnrollmentAnalytics, fetchEnrollmentRows, fetchRevenueAnalytics,
  type EnrollmentAnalytics, type RevenueAnalytics,
} from '@/lib/enrollment-analytics'
import { fetchCourses, type LmsCourse } from '@/lib/lms'
import { fetchOnlineClasses, fetchTeacherOptions, type OnlineClass, type TeacherOption } from '@/lib/online-classes'

const MAD = (n: number | string) => new Intl.NumberFormat('en-US').format(Math.round(Number(n)))
const STATUS_AR: Record<string, string> = { active: 'نشط', waitlisted: 'قائمة انتظار', completed: 'مكتمل', cancelled: 'ملغى' }

/**
 * الإيرادات والتقارير — every date-based number on this page follows the one
 * range control (Morocco days) and the filters, both kept in the URL. Blocks
 * that are deliberately not date-ranged say so in their title.
 */
export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="py-32 flex justify-center text-zinc-300"><Loader2 size={28} className="animate-spin" /></div>}>
      <Analytics />
    </Suspense>
  )
}

function Analytics() {
  const params = useSearchParams()
  const [query, setQuery] = useState<AnalyticsQuery>(() => parseQuery(params, businessToday()))
  // The tab is part of the same URL state as the range and filters; switching tabs never refetches.
  const { range, filters } = query
  const view: AnalyticsView = query.view ?? 'overview'
  const setView = (v: AnalyticsView) => setQuery(q => ({ ...q, view: v }))
  const prev = useMemo(() => previousRange(range), [range])
  const bucket = bucketFor(range)

  const [cur, setCur] = useState<EnrollmentAnalytics | null>(null)
  const [before, setBefore] = useState<EnrollmentAnalytics | null>(null)
  const [rev, setRev] = useState<RevenueAnalytics | null>(null)
  const [revBefore, setRevBefore] = useState<RevenueAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showRules, setShowRules] = useState(false)
  const [exporting, setExporting] = useState(false)

  const [courses, setCourses] = useState<LmsCourse[]>([])
  const [classes, setClasses] = useState<OnlineClass[]>([])
  const [teachers, setTeachers] = useState<TeacherOption[]>([])
  useEffect(() => {
    fetchCourses().then(setCourses)
    fetchOnlineClasses(true).then(setClasses).catch(() => setClasses([]))
    fetchTeacherOptions().then(setTeachers).catch(() => setTeachers([]))
  }, [])

  // Keep the URL in step so a view can be bookmarked or shared.
  useEffect(() => {
    const qs = toQueryString(query)
    const url = `${window.location.pathname}${qs ? `?${qs}` : ''}`
    if (url !== `${window.location.pathname}${window.location.search}`) window.history.replaceState(null, '', url)
  }, [query])

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const [a, r, ap, rp] = await Promise.all([
        fetchEnrollmentAnalytics(range, filters, bucket, true),
        fetchRevenueAnalytics(range, bucket, true),
        prev ? fetchEnrollmentAnalytics(prev, filters, bucket, false) : Promise.resolve(null),
        prev ? fetchRevenueAnalytics(prev, bucket, false) : Promise.resolve(null),
      ])
      setCur(a); setRev(r); setBefore(ap); setRevBefore(rp)
    } catch (e: any) { setError(e?.message ?? 'تعذّر تحميل الأرقام.') }
    finally { setLoading(false) }
  }, [range, filters, bucket, prev])
  useEffect(() => { load() }, [load])

  const setRange = (r: DateRange) => setQuery(q => ({ ...q, range: r }))
  const setFilter = (k: keyof AnalyticsFilters, v: string) =>
    setQuery(q => ({ ...q, filters: Object.fromEntries(Object.entries({ ...q.filters, [k]: v || undefined }).filter(([, x]) => x)) as AnalyticsFilters }))

  async function exportCsv() {
    if (!cur || !rev) return
    setExporting(true)
    try {
      const rows = await fetchEnrollmentRows(range, filters)
      const k = cur.kpis, pk = before?.kpis
      const label = (id?: string, list?: { id: string; title?: string; name?: string }[]) =>
        id ? (list?.find(x => x.id === id)?.title ?? list?.find(x => x.id === id)?.name ?? id) : ''
      const out: CsvCell[][] = [
        ['Inglizi — تقرير التسجيلات'],
        ['الفترة', range.from ?? 'البداية', range.to, 'بتوقيت المغرب'],
        ['الفترة السابقة', prev?.from ?? '—', prev?.to ?? '—'],
        ['الفلاتر', `دورة: ${label(filters.course_id, courses)}`, `قسم: ${label(filters.class_id, classes)}`,
          `أستاذ: ${label(filters.teacher_id, teachers)}`, `نوع: ${filters.mode ?? ''}`, `حالة: ${filters.status ?? ''}`],
        [],
        ['المؤشر', 'الفترة', 'الفترة السابقة'],
        ['تسجيلات الدورات', k.course_enrollments, pk?.course_enrollments],
        ['طلاب الدورات (فريدون)', k.course_students, pk?.course_students],
        ['تسجيلات الأقسام', k.class_enrollments, pk?.class_enrollments],
        ['طلاب الأقسام (فريدون)', k.class_students, pk?.class_students],
        ['تسجيلات جماعية', k.group_enrollments, pk?.group_enrollments],
        ['تسجيلات فردية', k.private_enrollments, pk?.private_enrollments],
        ['طلاب فريدون (الكل)', k.unique_students, pk?.unique_students],
        ['طلاب في دورة وقسم معًا', k.both_students, pk?.both_students],
        ['نشطون في نهاية الفترة: تسجيلات دورات', k.active_at_end.course_enrollments, pk?.active_at_end.course_enrollments],
        ['نشطون في نهاية الفترة: مقاعد أقسام', k.active_at_end.class_enrollments, pk?.active_at_end.class_enrollments],
        ['نشطون في نهاية الفترة: طلاب فريدون', k.active_at_end.unique_students, pk?.active_at_end.unique_students],
        ['حصص منجزة', k.sessions_done, pk?.sessions_done],
        ['حصص ملغاة', k.sessions_cancelled, pk?.sessions_cancelled],
        ['علامات الحضور', k.attendance.marks, pk?.attendance.marks],
        ['نسبة الحضور %', k.attendance.rate, pk?.attendance.rate],
        ['الإيرادات المدفوعة (د.م، حسب تاريخ الدفع، غير مفلترة)', rev.kpis.revenue, revBefore?.kpis.revenue],
        ['عدد الدفعات', rev.kpis.payments, revBefore?.kpis.payments],
        ['طلاب دفعوا', rev.kpis.paying_students, revBefore?.kpis.paying_students],
        [],
        ['النوع', 'الطالب', 'الدورة / القسم', 'جماعي/فردي', 'الأستاذ', 'الحالة', 'تاريخ التسجيل', 'تاريخ الانتهاء'],
        ...rows.map(r => [r.kind === 'course' ? 'دورة' : 'قسم', r.student, r.item,
          r.mode === 'group' ? 'جماعي' : r.mode === 'private' ? 'فردي' : '', r.teacher ?? '', STATUS_AR[r.status] ?? r.status,
          r.enrolled_on, r.ended_on ?? '']),
      ]
      const blob = new Blob([toCsv(out)], { type: 'text/csv;charset=utf-8' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `inglizi-enrollments_${range.from ?? 'all'}_${range.to}.csv`
      a.click()
      URL.revokeObjectURL(a.href)
    } catch (e: any) { setError(e?.message ?? 'تعذّر التصدير.') }
    finally { setExporting(false) }
  }

  const k = cur?.kpis, pk = before?.kpis
  const compareLabel = prev ? `مقارنة بـ ${describeRange(prev)}` : 'لا مقارنة لكل الأوقات'
  const filtered = hasEntityFilters(filters)

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Controls: one row above everything they drive */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-3 sm:p-4 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <RangeControls value={range} onChange={setRange} />
          <div className="flex gap-2">
            <button onClick={() => setShowRules(v => !v)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 text-zinc-600 text-[12.5px] font-bold hover:border-zinc-300">
              <Info size={14} /> طريقة العدّ
            </button>
            <button onClick={exportCsv} disabled={!cur || exporting} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 text-zinc-600 text-[12.5px] font-bold hover:border-zinc-300 disabled:opacity-50">
              {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} CSV
            </button>
            <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 text-zinc-600 text-[12.5px] font-bold hover:border-zinc-300">
              <RotateCcw size={14} /> تحديث
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <FilterSelect label="الدورة" value={filters.course_id} onChange={v => setFilter('course_id', v)}
            options={courses.map(c => [c.id, c.title])} />
          <FilterSelect label="القسم" value={filters.class_id} onChange={v => setFilter('class_id', v)}
            options={classes.map(c => [c.id, c.title + (c.archived_at ? ' (مؤرشف)' : '')])} />
          <FilterSelect label="الأستاذ" value={filters.teacher_id} onChange={v => setFilter('teacher_id', v)}
            options={teachers.map(t => [t.id, t.name])} />
          <FilterSelect label="النوع" value={filters.mode} onChange={v => setFilter('mode', v)}
            options={[['group', 'جماعي'], ['private', 'فردي']]} />
          <FilterSelect label="الحالة" value={filters.status} onChange={v => setFilter('status', v)}
            options={[['active', 'نشط'], ['waitlisted', 'قائمة انتظار'], ['completed', 'مكتمل'], ['cancelled', 'ملغى']]} />
        </div>
        {filtered && (
          <button onClick={() => setQuery(q => ({ ...q, filters: {} }))} className="inline-flex items-center gap-1 text-[12px] font-bold text-blue-600">
            <X size={12} /> مسح الفلاتر
          </button>
        )}
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-zinc-200" role="tablist" aria-label="أقسام الإحصائيات">
        {([
          ['overview', 'نظرة عامة'], ['enrollments', 'التسجيلات'],
          ['revenue', 'الإيرادات'], ['teachers', 'الأساتذة'],
        ] as const).map(([id, label]) => (
          <button key={id} role="tab" aria-selected={view === id} onClick={() => setView(id)}
            className={`shrink-0 px-4 py-2.5 text-[13px] font-bold border-b-2 transition-colors ${view === id ? 'border-yellow-400 text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-800'}`}>
            {label}
          </button>
        ))}
      </div>

      {showRules && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-4">
          <h3 className="font-black text-[14px] text-zinc-900 mb-2">طريقة العدّ</h3>
          <dl className="grid md:grid-cols-2 gap-x-6 gap-y-2">
            {COUNTING_RULES.map(r => (
              <div key={r.term} className="text-[12.5px] leading-relaxed">
                <dt className="font-bold text-zinc-800 inline">{r.term}: </dt>
                <dd className="inline text-zinc-600">{r.rule}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {error && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-[13px] font-bold text-red-700">
          <span className="flex-1 min-w-0">{error}</span>
          <button onClick={load} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-red-200 text-[12px] hover:bg-red-100">
            <RotateCcw size={13} /> إعادة المحاولة
          </button>
        </div>
      )}

      {loading && !cur ? (
        <div className="py-32 flex justify-center text-zinc-300"><Loader2 size={28} className="animate-spin" /></div>
      ) : cur && k && rev ? (
        <div className={`space-y-5 transition-opacity ${loading ? 'opacity-60' : ''}`}>
          {view === 'overview' && (
            <>
              <Section icon={Users} title="ملخص التسجيلات والإيرادات" note={`${describeRange(range)} · ${compareLabel}`}>
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-2.5">
                  <Kpi label="تسجيلات الدورات" value={k.course_enrollments} prev={pk?.course_enrollments} dot="#2a78d6" />
                  <Kpi label="تسجيلات الأقسام المباشرة" value={k.class_enrollments} prev={pk?.class_enrollments} dot="#eb6834" />
                  <Kpi label="طلاب فريدون (دورات + أقسام)" value={k.unique_students} prev={pk?.unique_students} strong />
                  <Kpi label={filtered ? 'الإيرادات المدفوعة (غير مفلترة)' : 'الإيرادات المدفوعة'} value={Number(rev.kpis.revenue)} prev={revBefore ? Number(revBefore.kpis.revenue) : undefined} money />
                </div>
                <p className="text-[11.5px] text-zinc-400 mt-2">تسجيلات الدورات، مقاعد الأقسام، والإيراد مقاييس منفصلة؛ الطالب المسجّل في النوعين يُحسب مرة واحدة ضمن الطلاب الفريدين.</p>
              </Section>
              {cur.lifetime && rev.lifetime && (
                <div className="bg-zinc-50 border border-dashed border-zinc-300 rounded-2xl p-4">
                  <div className="text-[13px] font-black text-zinc-800">كل الأوقات</div>
                  <div className="text-[11px] text-zinc-400 mb-3">لا يتأثر بالفترة {filtered ? '— الفلاتر مطبَّقة على أرقام التسجيل فقط' : ''}</div>
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-x-6">
                    <MiniRow label="كل تسجيلات الدورات" value={cur.lifetime.course_enrollments} />
                    <MiniRow label="كل تسجيلات الأقسام" value={cur.lifetime.class_enrollments} />
                    <MiniRow label="طلاب سُجّلوا يومًا (فريدون)" value={cur.lifetime.unique_students} />
                    <MiniRow label="تسجيلات دورات نشطة الآن" value={cur.lifetime.active_now_course} />
                    <MiniRow label="مقاعد أقسام نشطة الآن" value={cur.lifetime.active_now_class} />
                    <MiniRow label="كل الإيرادات المدفوعة" value={`${MAD(rev.lifetime.revenue)} د.م`} />
                  </div>
                </div>
              )}
            </>
          )}

          {view === 'enrollments' && <>
          {/* Enrollments in the period */}
          <Section icon={Users} title="التسجيلات في الفترة" note={`${describeRange(range)} · ${compareLabel}`}>
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-2.5">
              <Kpi label="تسجيلات الدورات" value={k.course_enrollments} prev={pk?.course_enrollments} dot="#2a78d6" />
              <Kpi label="طلاب الدورات (فريدون)" value={k.course_students} prev={pk?.course_students} />
              <Kpi label="تسجيلات الأقسام" value={k.class_enrollments} prev={pk?.class_enrollments} dot="#eb6834" />
              <Kpi label="طلاب الأقسام (فريدون)" value={k.class_students} prev={pk?.class_students} />
              <Kpi label="جماعي" value={k.group_enrollments} prev={pk?.group_enrollments} sub={`${k.group_students} طالب`} />
              <Kpi label="فردي" value={k.private_enrollments} prev={pk?.private_enrollments} sub={`${k.private_students} طالب`} />
              <Kpi label="طلاب فريدون — الكل" value={k.unique_students} prev={pk?.unique_students}
                sub={k.both_students ? `${k.both_students} في دورة وقسم معًا` : undefined} strong />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-3">
              <StatusBlock title="حالة تسجيلات الدورات في الفترة" items={[
                ['نشط', k.course_status.active], ['مكتمل', k.course_status.completed], ['أُلغي', k.course_status.cancelled]]} />
              <StatusBlock title="حالة تسجيلات الأقسام في الفترة" items={[
                ['نشط', k.class_status.active], ['قائمة انتظار', k.class_status.waitlisted],
                ['مكتمل', k.class_status.completed], ['ملغى', k.class_status.cancelled]]} />
              <div className="bg-white border border-zinc-200 rounded-2xl p-4">
                <div className="text-[12.5px] font-black text-zinc-800">نشطون في نهاية الفترة</div>
                <div className="text-[11px] text-zinc-400 mb-2">في {new Date(k.active_at_end.as_of).toLocaleDateString('ar-MA', { dateStyle: 'medium', timeZone: 'Africa/Casablanca' })} — ليس عدد التسجيلات الجديدة</div>
                <MiniRow label="تسجيلات دورات نشطة" value={k.active_at_end.course_enrollments} />
                <MiniRow label="مقاعد أقسام نشطة" value={`${k.active_at_end.class_enrollments} (${k.active_at_end.group_enrollments} جماعي · ${k.active_at_end.private_enrollments} فردي)`} />
                <MiniRow label="طلاب نشطون (فريدون)" value={k.active_at_end.unique_students} />
              </div>
            </div>
          </Section>
          </>}

          {view === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ChartCard title="التسجيلات: الدورات مقابل الأقسام">
                <EnrollmentTrend data={cur.trend ?? []} bucket={bucket} />
              </ChartCard>
              <ChartCard title="الإيرادات المدفوعة — حسب تاريخ الدفع">
                <RevenueTrend data={rev.trend ?? []} bucket={bucket} />
              </ChartCard>
            </div>
          )}
          {view === 'enrollments' && (
            <ChartCard title={`التسجيلات حسب ${bucket === 'day' ? 'اليوم' : bucket === 'week' ? 'الأسبوع' : 'الشهر'} — حسب تاريخ التسجيل`}>
              <EnrollmentTrend data={cur.trend ?? []} bucket={bucket} />
            </ChartCard>
          )}
          {view === 'revenue' && (
            <ChartCard title="الإيرادات المدفوعة — حسب تاريخ الدفع">
              <RevenueTrend data={rev.trend ?? []} bucket={bucket} />
            </ChartCard>
          )}

          {view === 'revenue' && <>
          {/* Revenue — separate from enrollment counts */}
          <Section icon={Wallet} title="الإيرادات المدفوعة في الفترة"
            note={filtered ? 'لا تتأثر بفلاتر الدورة/القسم/الأستاذ/النوع/الحالة — الدفعة غير مرتبطة بتسجيل' : 'دفعات مؤكَّدة فقط، حسب تاريخ الدفع'}>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
              <Kpi label="الإيرادات (د.م)" value={Number(rev.kpis.revenue)} prev={revBefore ? Number(revBefore.kpis.revenue) : undefined} money strong />
              <Kpi label="عدد الدفعات" value={rev.kpis.payments} prev={revBefore?.kpis.payments} />
              <Kpi label="طلاب دفعوا" value={rev.kpis.paying_students} prev={revBefore?.kpis.paying_students} />
            </div>
          </Section>
          </>}

          {view === 'teachers' && <>
          {/* Sessions + attendance */}
          <Section icon={CalendarCheck} title="الحصص والحضور في الفترة" note="حسب تاريخ الحصة — الحضور لا يغيّر أرقام التسجيل">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5">
              <Kpi label="حصص منجزة" value={k.sessions_done} prev={pk?.sessions_done} sub={`${k.hours_done} ساعة`} />
              <Kpi label="حصص ملغاة" value={k.sessions_cancelled} prev={pk?.sessions_cancelled} invert />
              <Kpi label="نسبة الحضور %" value={k.attendance.rate ?? 0} prev={pk?.attendance.rate ?? undefined} empty={k.attendance.rate == null}
                sub={`${k.attendance.marks} علامة`} />
              <Kpi label="غيابات" value={k.attendance.absent} prev={pk?.attendance.absent} invert />
              <Kpi label="تقارير ناقصة" value={k.reports_owed} prev={pk?.reports_owed} invert />
            </div>
          </Section>
          </>}

          {view === 'enrollments' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="حسب الدورة">
              {(cur.by_course ?? []).length === 0 ? <Empty /> : (
                <DataTable head={['الدورة', 'تسجيلات', 'طلاب', 'نشط', 'مكتمل', 'أُلغي']}
                  rows={(cur.by_course ?? []).map(r => [r.title, r.enrollments, r.students, r.active, r.completed, r.cancelled])} />
              )}
            </ChartCard>
            <ChartCard title="حسب القسم">
              {(cur.by_class ?? []).length === 0 ? <Empty /> : (
                <DataTable head={['القسم', 'النوع', 'الأستاذ', 'تسجيلات', 'نشط', 'انتظار', 'ملغى']}
                  rows={(cur.by_class ?? []).map(r => [r.title, r.mode === 'group' ? 'جماعي' : 'فردي', r.teacher_name ?? '—', r.enrollments, r.active, r.waitlisted, r.cancelled])} />
              )}
            </ChartCard>
          </div>
          )}

          {view === 'teachers' && (
            <ChartCard title="الأساتذة في الفترة"
              action={<Link href="/admin/teachers" className="text-[12px] text-blue-600 font-semibold">لوحة الأساتذة (الإسناد، الدورات، المقاعد) ←</Link>}>
              {(cur.by_teacher ?? []).length === 0 ? <Empty /> : (
                <>
                  <DataTable head={['الأستاذ', 'تسجيلات في أقسامه (مقاعد)', 'طلاب أقسامه (فريدون)', 'حصص منجزة', 'ملغاة', 'الحضور %']}
                    rows={(cur.by_teacher ?? []).map(r => [r.name, r.class_enrollments, r.class_students, r.sessions_done, r.sessions_cancelled, r.attendance_rate ?? '—'])} />
                  <p className="text-[11.5px] text-zinc-400 mt-2">
                    تسجيلات الأقسام التي بدأت في الفترة، لا الإسناد ولا تسجيلات الدورات — تلك في لوحة الأساتذة. لا تُجمع أعمدة «فريدون» بين الأساتذة.
                  </p>
                </>
              )}
            </ChartCard>
          )}

          {view === 'revenue' && (
            <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <ChartCard title="الإيرادات حسب الدورة / الخدمة">
              <Breakdown rows={rev.by_course ?? []} />
            </ChartCard>
            <ChartCard title="الإيرادات حسب المصدر">
              <Breakdown rows={rev.by_source ?? []} />
            </ChartCard>
            <ChartCard title="الإيرادات حسب المسؤول">
              <Breakdown rows={rev.by_staff ?? []} />
            </ChartCard>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center"><Wallet size={14} /></span>
              <h2 className="text-[14px] font-black text-zinc-800">المستحقات</h2>
              <span className="text-[11px] text-zinc-400 font-semibold">الوضع الحالي — لا يتأثر بالفترة</span>
            </div>
            <DuesBoard onChanged={load} />
          </div>
            </>
          )}

          {view === 'overview' && rev.funnel && (
            <ChartCard title="تحويل العملاء المحتملين في الفترة — عملاء الفترة حسب تاريخ إنشائهم">
              {rev.funnel.total === 0 ? <Empty /> : <Funnel steps={[
                { label: 'كل العملاء', count: rev.funnel.total, pct: 100 },
                { label: 'تم التواصل', count: rev.funnel.contacted, pct: pct(rev.funnel.contacted, rev.funnel.total) },
                { label: 'مؤكَّد', count: rev.funnel.confirmed, pct: pct(rev.funnel.confirmed, rev.funnel.total) },
                { label: 'دفع', count: rev.funnel.paid, pct: pct(rev.funnel.paid, rev.funnel.total) },
              ]} />}
            </ChartCard>
          )}
        </div>
      ) : null}
    </div>
  )
}

const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 100) : 0)

function FilterSelect({ label, value, onChange, options }: {
  label: string; value?: string; onChange: (v: string) => void; options: [string, string][]
}) {
  return (
    <label className="block min-w-0">
      <span className="block text-[11px] font-bold text-zinc-400 mb-1">{label}</span>
      <select value={value ?? ''} onChange={e => onChange(e.target.value)}
        className={`w-full border rounded-lg px-2.5 py-2 text-[12.5px] bg-white truncate ${value ? 'border-yellow-400 ring-1 ring-yellow-400' : 'border-zinc-200'}`}>
        <option value="">الكل</option>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  )
}

function Section({ icon: Icon, title, note, children }: { icon: any; title: string; note?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="w-7 h-7 rounded-lg bg-zinc-900 text-yellow-400 flex items-center justify-center"><Icon size={14} /></span>
        <h2 className="text-[14px] font-black text-zinc-800">{title}</h2>
        {note && <span className="text-[11px] text-zinc-400 font-semibold">{note}</span>}
      </div>
      {children}
    </section>
  )
}

function Kpi({ label, value, prev, sub, strong, money, invert, empty, dot }: {
  label: string; value: number; prev?: number; sub?: string; strong?: boolean; money?: boolean
  /** lower is better (absences, cancellations) */
  invert?: boolean; empty?: boolean; dot?: string
}) {
  const d = prev === undefined ? undefined : deltaPct(value, prev)
  const good = d != null && (invert ? d < 0 : d > 0)
  const bad = d != null && (invert ? d > 0 : d < 0)
  return (
    <div className={`rounded-2xl border p-3.5 ${strong ? 'bg-zinc-900 border-zinc-900' : 'bg-white border-zinc-200'}`}>
      <div className={`text-[11.5px] flex items-center gap-1.5 ${strong ? 'text-zinc-400' : 'text-zinc-500'}`}>
        {dot && <span className="w-2 h-2 rounded-sm" style={{ background: dot }} />}{label}
      </div>
      <div className={`text-[22px] font-black tabular-nums mt-0.5 ${strong ? 'text-white' : 'text-zinc-900'}`}>
        {empty ? '—' : money ? MAD(value) : value.toLocaleString('en-US')}
      </div>
      <div className="flex items-center gap-1.5 text-[11px] mt-0.5 min-h-[16px]">
        {prev !== undefined && (
          d == null
            ? <span className={strong ? 'text-zinc-400' : 'text-zinc-400'}>{value > 0 ? 'جديد' : '—'}</span>
            : <span className={`font-bold ${good ? 'text-emerald-500' : bad ? 'text-rose-500' : strong ? 'text-zinc-400' : 'text-zinc-400'}`} dir="ltr">
                {d > 0 ? '▲' : d < 0 ? '▼' : '■'} {Math.abs(d)}%
              </span>
        )}
        {prev !== undefined && <span className={strong ? 'text-zinc-500' : 'text-zinc-300'}>({money ? MAD(prev) : prev})</span>}
        {sub && <span className={strong ? 'text-zinc-400' : 'text-zinc-400'}>· {sub}</span>}
      </div>
    </div>
  )
}

function StatusBlock({ title, items }: { title: string; items: [string, number][] }) {
  const total = items.reduce((a, [, n]) => a + n, 0)
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-4">
      <div className="text-[12.5px] font-black text-zinc-800 mb-2">{title}</div>
      {items.map(([l, n]) => <MiniRow key={l} label={l} value={`${n}${total ? ` · ${pct(n, total)}%` : ''}`} />)}
    </div>
  )
}

function MiniRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between text-[12.5px] py-1 border-b border-zinc-50 last:border-none">
      <span className="text-zinc-500">{label}</span>
      <span className="font-bold text-zinc-800 tabular-nums">{value}</span>
    </div>
  )
}

function Breakdown({ rows }: { rows: { label: string; mad: number; count: number }[] }) {
  if (rows.length === 0) return <Empty />
  const max = Math.max(...rows.map(r => Number(r.mad)), 1)
  return (
    <div className="space-y-2.5">
      {rows.slice(0, 8).map(r => (
        <div key={r.label}>
          <div className="flex items-center justify-between text-[12px] mb-1">
            <span className="font-semibold text-zinc-700 truncate">{r.label}</span>
            <span className="text-zinc-500 tabular-nums flex-shrink-0" dir="ltr">{MAD(r.mad)} د.م · {r.count}</span>
          </div>
          <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#eda100] rounded-full" style={{ width: `${(Number(r.mad) / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function Empty() {
  return <p className="text-[13px] text-zinc-400 py-8 text-center">لا بيانات في هذه الفترة</p>
}
