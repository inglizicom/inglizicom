'use client'

import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import {
  BarChart3, Activity, Video, FileText, BookOpen, FileEdit,
  Database, Lock, Settings, ArrowUpRight, KanbanSquare, Shield,
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
    <div className="px-6 lg:px-10 py-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4 mb-7">
        <div>
          <div className="text-[11px] uppercase font-bold tracking-[0.18em] text-gray-400 mb-1 flex items-center gap-1">
            <Shield size={11} /> Founder command center
          </div>
          <h1 className="text-[28px] font-black tracking-tight text-gray-900">
            Hello, {me.email?.split('@')[0]}.
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Content management, audit log, analytics, and system tools.
            Day-to-day sales lives in the workspace.
          </p>
        </div>
        <Link
          href="/sales"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-black text-yellow-400 text-sm font-bold hover:bg-zinc-800 shadow-sm"
        >
          <KanbanSquare size={14} /> Open Sales workspace
        </Link>
      </header>

      {/* Insights */}
      <Section title="Insights" subtitle="See the business from above.">
        <Tile icon={BarChart3}  href="/admin/analytics" title="Analytics"     description="Revenue, sources, conversion · 90 days" />
        <Tile icon={Activity}   href="/admin/activity"  title="Activity Log"  description="Every staff action with before/after" />
      </Section>

      {/* Content */}
      <Section title="Content" subtitle="What students see on the site.">
        <Tile icon={Video}     href="/admin/courses"  title="Courses"       description="Manage video courses" />
        <Tile icon={FileText}  href="/admin/articles" title="Articles"      description="Blog posts and resources" />
        <Tile icon={BookOpen}  href="/admin/lessons"  title="Lessons"       description="Conversation + grammar lessons" />
        <Tile icon={FileEdit}  href="/admin/content"  title="Listen Studio" description="Audio + transcript editor" />
      </Section>

      {/* System */}
      <Section title="System" subtitle="Who has access, and how the back-end is wired.">
        <Tile icon={Settings} href="/admin/settings"  title="Staff settings" description="Manage founders + assistants" />
        <Tile icon={Lock}     href="/admin/access"    title="Access"          description="Feature access + plan gates" />
        <Tile icon={Database} href="/admin/bootstrap" title="Bootstrap"       description="Seed data + one-time admin tasks" />
      </Section>
    </div>
  )
}

/* ───────── components ───────── */

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <div className="flex items-baseline gap-3 mb-3">
        <h2 className="font-black text-gray-900 text-lg tracking-tight">{title}</h2>
        <span className="text-[12px] text-gray-400">{subtitle}</span>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">{children}</div>
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
      className="group block bg-white border border-gray-200 rounded-2xl p-4 hover:border-gray-400 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center group-hover:bg-yellow-50 group-hover:text-yellow-700">
          <Icon size={16} />
        </div>
        <ArrowUpRight size={15} className="text-gray-300 group-hover:text-gray-900" />
      </div>
      <div className="font-bold text-gray-900 text-[14.5px] mb-0.5">{title}</div>
      <div className="text-[12px] text-gray-500 leading-snug">{description}</div>
    </Link>
  )
}
