'use client'

import { useEffect, useState } from 'react'
import {
  Gauge, TrendingUp, Users, UserPlus, Target, Coins, AlertTriangle,
  Trophy, Flame, BookOpen, RefreshCw, ArrowUpRight, ArrowDownRight,
} from 'lucide-react'
import {
  fetchOwnerOverview, fetchOwnerRevenueTrend, fetchOwnerTeam,
  fetchOwnerStudents, fetchOwnerCourses, fetchOwnerAlerts,
  type OwnerOverview, type TeamMember, type StudentIntel,
  type CourseStat, type OwnerAlert, type RevenuePoint,
} from '@/lib/owner'
import { ENROLLMENT_TYPES } from '@/lib/crm-types'

const mad = (n: number | null | undefined) => `${Math.round(Number(n ?? 0)).toLocaleString('en-US')} درهم`

export default function CommandCenterPage() {
  const [loading, setLoading] = useState(true)
  const [ov, setOv] = useState<OwnerOverview | null>(null)
  const [trend, setTrend] = useState<RevenuePoint[]>([])
  const [team, setTeam] = useState<TeamMember[]>([])
  const [intel, setIntel] = useState<StudentIntel | null>(null)
  const [courses, setCourses] = useState<CourseStat[]>([])
  const [alerts, setAlerts] = useState<OwnerAlert[]>([])

  async function load() {
    setLoading(true)
    const [o, tr, t, si, c, a] = await Promise.all([
      fetchOwnerOverview(), fetchOwnerRevenueTrend(), fetchOwnerTeam(),
      fetchOwnerStudents(), fetchOwnerCourses(), fetchOwnerAlerts(),
    ])
    setOv(o); setTrend(tr); setTeam(t); setIntel(si); setCourses(c); setAlerts(a)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const maxTrend = Math.max(1, ...trend.map(p => p.mad))

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-[11px] uppercase font-bold tracking-[0.18em] text-gray-400 mb-1 flex items-center gap-1">
            <Gauge size={11} /> Owner command center
          </div>
          <h1 className="text-[28px] font-black tracking-tight text-gray-900">The whole business, in 60 seconds.</h1>
          <p className="text-sm text-gray-500 mt-1">Revenue · students · team · activity · risks — one source of truth.</p>
        </div>
        <button onClick={load} disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-black text-yellow-400 text-sm font-bold hover:bg-zinc-800 shadow-sm disabled:opacity-50">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </header>

      {loading && !ov && <div className="text-sm text-gray-400 py-20 text-center">Loading…</div>}

      {/* ── Smart alerts ── */}
      {alerts.length > 0 && (
        <div className="mb-6 space-y-2">
          {alerts.map((a, i) => (
            <div key={i} className={[
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold border',
              a.level === 'danger' ? 'bg-red-50 text-red-700 border-red-200'
                : a.level === 'warn' ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-blue-50 text-blue-700 border-blue-200',
            ].join(' ')} dir="rtl">
              <AlertTriangle size={15} className="flex-shrink-0" /><span>{a.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── A. Business overview ── */}
      {ov && (
        <>
          <SectionTitle icon={TrendingUp}>Business overview</SectionTitle>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            <Kpi label="Revenue today"     value={mad(ov.rev_today)}  accent />
            <Kpi label="This week"          value={mad(ov.rev_week)} />
            <Kpi label="This month"         value={mad(ov.rev_month)} />
            <Kpi label="This year"          value={mad(ov.rev_year)} />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            <Kpi label="New leads today"    value={ov.new_leads_today} icon={UserPlus} />
            <Kpi label="New students today" value={ov.new_students_today} icon={UserPlus} />
            <Kpi label="Conversion rate"    value={`${ov.conversion_rate}%`} icon={Target} />
            <Kpi label="Avg revenue / student" value={mad(ov.arpu)} icon={TrendingUp} />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <Kpi label="Active students"    value={ov.active_students} icon={Users} good />
            <Kpi label="Inactive students"  value={ov.inactive_students} icon={Users} />
            <Kpi label="At risk (7d+ idle)" value={ov.at_risk} icon={AlertTriangle} bad={ov.at_risk > 0} />
            <Kpi label="Paying students"    value={ov.paying_students} icon={Coins} />
          </div>

          <div className="grid lg:grid-cols-3 gap-4 mb-7">
            {/* Revenue trend */}
            <Card className="lg:col-span-2">
              <CardHead>Revenue · last 6 months</CardHead>
              <div className="flex items-end gap-2 h-40 px-1">
                {trend.map(p => (
                  <div key={p.month} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full bg-yellow-400 rounded-t-md transition-all" style={{ height: `${Math.max(4, (p.mad / maxTrend) * 130)}px` }} title={mad(p.mad)} />
                    <span className="text-[10px] text-gray-400">{p.month.slice(5)}</span>
                  </div>
                ))}
              </div>
            </Card>
            {/* Top / worst course */}
            <Card>
              <CardHead>Courses</CardHead>
              <Row label="🏆 Top course" value={ov.top_course ? `${ov.top_course.title} (${ov.top_course.students})` : '—'} />
              <Row label="📉 Least popular" value={ov.worst_course ? `${ov.worst_course.title} (${ov.worst_course.students})` : '—'} />
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Rewards</div>
                <Row label="Coins distributed" value={Number(ov.rewards.coins_distributed).toLocaleString()} />
                <Row label="Coins spent" value={Number(ov.rewards.coins_spent).toLocaleString()} />
                <Row label="Claims pending" value={ov.rewards.claims_pending} />
              </div>
            </Card>
          </div>

          {/* Enrollment types */}
          <SectionTitle icon={Users}>Enrollment types</SectionTitle>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-7">
            {ENROLLMENT_TYPES.map(t => (
              <div key={t.id} className={`rounded-xl border p-3 ${t.color}`}>
                <div className="text-[13px] font-bold flex items-center gap-1.5">{t.emoji} {t.label}</div>
                <div className="text-2xl font-black mt-1">{ov.enroll?.[t.id] ?? 0}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── B. Team performance ── */}
      <SectionTitle icon={Users}>Team performance</SectionTitle>
      <Card className="mb-7 overflow-x-auto">
        {team.length === 0 ? <Empty>No assistants yet.</Empty> : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-gray-400 text-[11px] uppercase tracking-wider border-b border-gray-100">
                <th className="py-2 pr-3 font-bold">Assistant</th>
                <th className="py-2 px-2 font-bold">Leads</th>
                <th className="py-2 px-2 font-bold">Confirmed</th>
                <th className="py-2 px-2 font-bold">Paid</th>
                <th className="py-2 px-2 font-bold">Revenue</th>
                <th className="py-2 px-2 font-bold">Overdue f/u</th>
                <th className="py-2 px-2 font-bold">Conv.</th>
              </tr>
            </thead>
            <tbody>
              {team.map((m, i) => {
                const conv = m.leads_handled > 0 ? Math.round((m.paid_students / m.leads_handled) * 100) : 0
                return (
                  <tr key={m.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 pr-3 font-bold text-gray-900">{i === 0 && m.revenue > 0 ? '🥇 ' : ''}{m.name}</td>
                    <td className="py-2.5 px-2">{m.leads_handled}</td>
                    <td className="py-2.5 px-2">{m.confirmed}</td>
                    <td className="py-2.5 px-2">{m.paid_students}</td>
                    <td className="py-2.5 px-2 font-bold text-emerald-700">{mad(m.revenue)}</td>
                    <td className={`py-2.5 px-2 ${m.followups_overdue > 0 ? 'text-amber-600 font-bold' : ''}`}>{m.followups_overdue}</td>
                    <td className="py-2.5 px-2">{conv}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </Card>

      {/* ── C. Student intelligence ── */}
      {intel && (
        <>
          <SectionTitle icon={AlertTriangle}>Student intelligence</SectionTitle>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            <Kpi label="Idle 3–7 days"  value={intel.inactive_3} />
            <Kpi label="Idle 7–14 days" value={intel.inactive_7} bad={intel.inactive_7 > 0} />
            <Kpi label="Idle 14–30 days" value={intel.inactive_14} bad={intel.inactive_14 > 0} />
            <Kpi label="Idle 30 days +" value={intel.inactive_30} bad={intel.inactive_30 > 0} />
          </div>
          <div className="grid lg:grid-cols-3 gap-4 mb-7">
            <Card>
              <CardHead><AlertTriangle size={13} className="inline -mt-0.5 mr-1" />At-risk students</CardHead>
              {intel.at_risk_list.length === 0 ? <Empty>Nobody at risk 🎉</Empty> : intel.at_risk_list.slice(0, 8).map((s, i) => (
                <Row key={i} label={s.name} value={
                  <span className={[
                    'text-[11px] font-bold px-2 py-0.5 rounded-full',
                    s.risk === 'high' ? 'bg-red-100 text-red-700' : s.risk === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600',
                  ].join(' ')}>{s.days}d · {s.risk}</span>
                } />
              ))}
            </Card>
            <Card>
              <CardHead><Trophy size={13} className="inline -mt-0.5 mr-1" />Top by coins</CardHead>
              {intel.top_coins.length === 0 ? <Empty>—</Empty> : intel.top_coins.slice(0, 8).map((s, i) => (
                <Row key={i} label={`${i + 1}. ${s.name}`} value={<span className="font-bold text-yellow-600">{s.coins} 🪙</span>} />
              ))}
            </Card>
            <Card>
              <CardHead><Flame size={13} className="inline -mt-0.5 mr-1" />Top by streak</CardHead>
              {intel.top_streak.length === 0 ? <Empty>—</Empty> : intel.top_streak.slice(0, 8).map((s, i) => (
                <Row key={i} label={`${i + 1}. ${s.name}`} value={<span className="font-bold text-orange-600">{s.streak} 🔥</span>} />
              ))}
            </Card>
          </div>
        </>
      )}

      {/* ── D. Course analytics ── */}
      <SectionTitle icon={BookOpen}>Course analytics</SectionTitle>
      <Card className="overflow-x-auto">
        {courses.length === 0 ? <Empty>No courses yet.</Empty> : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-gray-400 text-[11px] uppercase tracking-wider border-b border-gray-100">
                <th className="py-2 pr-3 font-bold">Course</th>
                <th className="py-2 px-2 font-bold">Students</th>
                <th className="py-2 px-2 font-bold">Lessons</th>
                <th className="py-2 px-2 font-bold">Active (14d)</th>
                <th className="py-2 px-2 font-bold">Engagement</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(c => {
                const eng = c.students > 0 ? Math.round((c.active_14d / c.students) * 100) : 0
                return (
                  <tr key={c.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 pr-3 font-bold text-gray-900">{c.title}</td>
                    <td className="py-2.5 px-2">{c.students}</td>
                    <td className="py-2.5 px-2">{c.lessons}</td>
                    <td className="py-2.5 px-2">{c.active_14d}</td>
                    <td className="py-2.5 px-2 flex items-center gap-1">
                      {eng >= 50 ? <ArrowUpRight size={13} className="text-emerald-600" /> : <ArrowDownRight size={13} className="text-red-500" />}
                      <span className={eng >= 50 ? 'text-emerald-700 font-bold' : 'text-gray-600'}>{eng}%</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}

/* ── tiny presentational helpers ── */
function SectionTitle({ icon: Icon, children }: { icon: any; children: React.ReactNode }) {
  return <h2 className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.14em] text-gray-500 mb-3"><Icon size={14} />{children}</h2>
}
function Kpi({ label, value, icon: Icon, accent, good, bad }: { label: string; value: React.ReactNode; icon?: any; accent?: boolean; good?: boolean; bad?: boolean }) {
  return (
    <div className={[
      'rounded-xl border p-4',
      accent ? 'bg-black text-white border-black' : bad ? 'bg-red-50 border-red-200' : good ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-200',
    ].join(' ')}>
      <div className={`text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1 ${accent ? 'text-yellow-400' : 'text-gray-400'}`}>
        {Icon && <Icon size={11} />}{label}
      </div>
      <div className={`text-2xl font-black mt-1 ${accent ? 'text-white' : bad ? 'text-red-700' : good ? 'text-emerald-700' : 'text-gray-900'}`}>{value}</div>
    </div>
  )
}
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-2xl border border-gray-200 p-4 ${className}`}>{children}</div>
}
function CardHead({ children }: { children: React.ReactNode }) {
  return <div className="text-[12px] font-bold text-gray-700 mb-2.5">{children}</div>
}
function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-2 py-1 text-[13px]"><span className="text-gray-600 truncate">{label}</span><span className="font-semibold text-gray-900 flex-shrink-0">{value}</span></div>
}
function Empty({ children }: { children: React.ReactNode }) {
  return <div className="text-[13px] text-gray-400 py-4 text-center">{children}</div>
}
