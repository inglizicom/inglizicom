'use client'

import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import {
  BarChart3, Activity, Video, FileText, BookOpen, Presentation, Gauge,
  Database, Lock, Settings, ArrowUpLeft, KanbanSquare, Shield,
} from 'lucide-react'
import { useStaff } from '@/lib/staff-context'

/**
 * /admin — founder command center landing.
 *
 * Day-to-day sales operations live at /sales/*. This page is intentionally
 * sparse: the founder lands here when they need to manage content, audit
 * activity, or change system settings — not to triage leads.
 */
export default function AdminCommandCenterPage() {
  const me = useStaff()
  return (
    <div className="px-4 lg:px-8 py-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <header className="relative overflow-hidden rounded-[24px] text-white p-5 lg:p-7 mb-7 shadow-md flex flex-wrap items-center justify-between gap-4"
              style={{ background: 'linear-gradient(120deg, #1E3A8A 0%, #1E40AF 55%, #2563EB 100%)' }}>
        <div className="absolute -left-10 -top-12 w-52 h-52 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="text-[12px] font-bold text-white/75 mb-1 flex items-center gap-1.5">
            <Shield size={13} className="text-amber-300" /> أدوات المؤسس
          </div>
          <h1 className="text-[22px] lg:text-[26px] font-extrabold tracking-tight text-inherit">
            مرحبًا {me.email?.split('@')[0]}
          </h1>
          <p className="text-[13px] text-white/75 mt-1">
            المحتوى، سجل النشاط، التحليلات وإعدادات النظام. العمل اليومي مع العملاء في فضاء المبيعات.
          </p>
        </div>
        <Link
          href="/sales"
          className="relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-l from-amber-400 to-yellow-500 text-[#1E3A8A] text-[13px] font-bold ring-1 ring-amber-300 shadow-lg shadow-amber-500/30"
        >
          <KanbanSquare size={15} /> فضاء المبيعات
        </Link>
      </header>

      <Section title="المؤشرات" subtitle="رؤية شاملة للأعمال.">
        <Tile icon={Gauge}      href="/admin/command"   title="مركز القيادة"   description="الإيرادات والطلاب والتنبيهات مباشرة" />
        <Tile icon={BarChart3}  href="/admin/analytics" title="التحليلات"      description="الإيرادات، المصادر، التحويل" />
        <Tile icon={Activity}   href="/admin/activity"  title="سجل النشاط"     description="كل إجراء للفريق مع القيمة قبل وبعد" />
      </Section>

      <Section title="المحتوى" subtitle="ما يراه الطلاب على المنصة.">
        <Tile icon={Video}        href="/admin/courses"  title="الدورات المصوّرة" description="إدارة دورات الفيديو" />
        <Tile icon={FileText}     href="/admin/articles" title="المقالات"        description="مقالات المدونة والموارد" />
        <Tile icon={BookOpen}     href="/admin/lessons"  title="الدروس"          description="دروس المحادثة والقواعد" />
        <Tile icon={Presentation} href="/admin/present"  title="عروض الدروس"     description="عروض جاهزة للتسجيل · دورة الكتابة" />
      </Section>

      <Section title="النظام" subtitle="من يملك الصلاحيات وكيف يعمل النظام.">
        <Tile icon={Settings} href="/admin/settings"  title="إعدادات الفريق" description="إدارة المؤسسين والمساعدين" />
        <Tile icon={Lock}     href="/admin/access"    title="الصلاحيات"      description="الوصول للميزات وحدود الخطط" />
        <Tile icon={Database} href="/admin/bootstrap" title="تهيئة النظام"   description="بيانات أولية ومهام إدارية لمرة واحدة" />
      </Section>
    </div>
  )
}

/* ───────── components ───────── */

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <div className="flex items-baseline gap-3 mb-3">
        <h2 className="font-extrabold text-zinc-900 text-[17px] tracking-tight">{title}</h2>
        <span className="text-[12px] text-zinc-400">{subtitle}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">{children}</div>
    </section>
  )
}

function Tile({
  icon: Icon, href, title, description,
}: {
  icon: LucideIcon
  href: string
  title: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="group block bg-white border border-zinc-200 rounded-[20px] p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-blue-300 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center group-hover:bg-amber-100 group-hover:text-amber-700 transition-colors">
          <Icon size={17} />
        </div>
        <ArrowUpLeft size={15} className="text-zinc-300 group-hover:text-blue-700" />
      </div>
      <div className="font-bold text-zinc-900 text-[14.5px] mb-0.5">{title}</div>
      <div className="text-[12px] text-zinc-500 leading-snug">{description}</div>
    </Link>
  )
}
