'use client'

import Link from 'next/link'
import { ArrowLeft, BarChart3, BookOpen, CheckCircle2, Star, TrendingUp, Users } from 'lucide-react'
import { DEMO_PROFILE } from '../profile/demoData'

const s = DEMO_PROFILE.stats
const p = DEMO_PROFILE.profile

const kpis = [
  { label: 'طلاب نشطون', value: s.students_active, detail: 'مستوى النشاط الحالي' },
  { label: 'حصص منتهية', value: s.classes_done, detail: 'حتى الآن' },
  { label: 'ساعات تدريس', value: `${s.hours_total}h`, detail: 'إجمالي الوقت' },
  { label: 'تقييم متوسط', value: `${s.rating_avg.toFixed(1)}★`, detail: `${s.rating_count} تقييم` },
]

const progressBars = [
  { label: 'معدل الحضور', value: s.attendance_rate ?? 92, color: 'bg-emerald-500' },
  { label: 'نجاح الامتحانات', value: 81, color: 'bg-amber-500' },
  { label: 'الاحتفاظ بالطلاب', value: 76, color: 'bg-violet-500' },
]

const levels = [
  { label: 'A2', value: 8 },
  { label: 'B1', value: 15 },
  { label: 'B2', value: 12 },
  { label: 'C1', value: 6 },
]

export default function TeacherDemoNumbersPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#F4F7FC] text-[#1E3A8A]">
      <header className="border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/teacher/profile" className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] px-3 py-1.5 text-xs font-bold text-[#475569]">
              <ArrowLeft size={14} /> رجوع للملف
            </Link>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[.18em] text-[#B45309]">Demo</p>
              <h1 className="text-inherit text-lg font-black">أرقام تجريبية للمعلم</h1>
            </div>
          </div>
          <Link href="/teacher-showcase/demo" className="text-sm font-bold text-[#475569] hover:text-[#1E3A8A]">
            معاينة عامة
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <section className="rounded-[28px] bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 p-5 text-white shadow-[0_20px_40px_rgba(30,58,138,0.12)] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[.2em] text-[#FCD34D]">Teacher KPI</p>
              <h2 className="text-inherit mt-2 text-2xl font-black sm:text-4xl">ملف {p.display_name}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">هذه الصفحة تجريبية لعرض الأرقام بشكل جذاب وسهل القراءة، بحيث يكون من السهل فهم أداء المعلم قبل دعوة العملاء أو طباعة الملف.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              <span className="font-bold text-white">ملاحظة:</span> بيانات نموذجية فقط — لا تعكس حساباً حقيقياً.
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map(item => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-[.14em] text-slate-400">{item.label}</span>
                  <div className="rounded-full bg-[#FEF3C7] p-2 text-[#B45309]">
                    <TrendingUp size={14} />
                  </div>
                </div>
                <div className="mt-4 text-3xl font-black text-white">{item.value}</div>
                <div className="mt-2 text-xs text-slate-400">{item.detail}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-full bg-[#FEF3C7] p-2 text-[#B45309]">
                <BarChart3 size={18} />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[.18em] text-[#94A3B8]">performance</p>
                <h3 className="text-inherit text-xl font-black">مؤشرات الأداء</h3>
              </div>
            </div>

            <div className="space-y-5">
              {progressBars.map(item => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between text-sm font-bold text-[#334155]">
                    <span>{item.label}</span>
                    <span>{item.value}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-[#EEF2F7]">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-full bg-[#eaf6ee] p-2 text-[#1e6d4d]">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[.18em] text-[#94A3B8]">results</p>
                <h3 className="text-inherit text-xl font-black">أرقام رئيسية</h3>
              </div>
            </div>

            <div className="space-y-4 text-sm text-[#475569]">
              <div className="flex items-center justify-between rounded-2xl bg-[#F8FAFC] p-3">
                <span className="font-bold">إجمالي الطلاب</span>
                <span className="text-xl font-black text-[#1E3A8A]">{s.students_total}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-[#F8FAFC] p-3">
                <span className="font-bold">طلاب ناجحون</span>
                <span className="text-xl font-black text-[#1E3A8A]">{s.exams_passed}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-[#F8FAFC] p-3">
                <span className="font-bold">إجمالي التقييمات</span>
                <span className="text-xl font-black text-[#1E3A8A]">{s.rating_count}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-[#F8FAFC] p-3">
                <span className="font-bold">معدل الحضور</span>
                <span className="text-xl font-black text-[#1E3A8A]">{s.attendance_rate ?? 92}%</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-[#E2E8F0] bg-white p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-full bg-[#FEF3C7] p-2 text-[#B45309]">
              <Users size={18} />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[.18em] text-[#94A3B8]">audience</p>
              <h3 className="text-inherit text-xl font-black">توزيع المستويات</h3>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {levels.map(level => (
              <div key={level.label} className="rounded-2xl bg-[#F8FAFC] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#475569]">{level.label}</span>
                  <span className="text-xl font-black text-[#1E3A8A]">{level.value}</span>
                </div>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#EEF2F7]">
                  <div className="h-full rounded-full bg-[#1E3A8A]" style={{ width: `${(level.value / 15) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-5">
            <div className="mb-3 flex items-center gap-2 text-[#B45309]">
              <BookOpen size={18} />
              <span className="text-[11px] font-black uppercase tracking-[.18em] text-[#94A3B8]">material</span>
            </div>
            <div className="text-3xl font-black text-[#1E3A8A]">{s.materials}</div>
            <p className="mt-2 text-sm text-[#475569]">مواد وملفات تم تجهيزها للطلاب</p>
          </div>

          <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-5">
            <div className="mb-3 flex items-center gap-2 text-[#B45309]">
              <Star size={18} />
              <span className="text-[11px] font-black uppercase tracking-[.18em] text-[#94A3B8]">rating</span>
            </div>
            <div className="text-3xl font-black text-[#1E3A8A]">{s.rating_avg.toFixed(1)}</div>
            <p className="mt-2 text-sm text-[#475569]">متوسط تقييم الطلاب عبر جميع الحصص</p>
          </div>

          <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-5 md:col-span-2 xl:col-span-1">
            <div className="mb-3 flex items-center gap-2 text-[#B45309]">
              <TrendingUp size={18} />
              <span className="text-[11px] font-black uppercase tracking-[.18em] text-[#94A3B8]">growth</span>
            </div>
            <div className="text-3xl font-black text-[#1E3A8A]">+24%</div>
            <p className="mt-2 text-sm text-[#475569]">نمو مستمر في عدد الطلاب خلال آخر 90 يوماً</p>
          </div>
        </section>
      </div>
    </main>
  )
}
