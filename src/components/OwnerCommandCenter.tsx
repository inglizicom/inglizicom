'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  TrendingUp, Users, UserPlus, Target,
  AlertTriangle, Trophy, Flame, BookOpen, RefreshCw, Sparkles, Wallet,
  Activity, Crown, Zap, ChevronLeft,
} from 'lucide-react'
import PersonAvatar from '@/components/PersonAvatar'
import CoinIcon from '@/components/CoinIcon'
import {
  fetchOwnerOverview, fetchOwnerRevenueTrend, fetchOwnerTeam,
  fetchOwnerStudents, fetchOwnerCourses, fetchOwnerAlerts,
  type OwnerOverview, type TeamMember, type StudentIntel,
  type CourseStat, type OwnerAlert, type RevenuePoint,
} from '@/lib/owner'
import { ENROLLMENT_TYPES } from '@/lib/crm-types'

/* ── number helpers ── */
const fmt = (n: number) => Math.round(n).toLocaleString('en-US')

const AR_MONTHS = ['ينا', 'فبر', 'مار', 'أبر', 'ماي', 'يون', 'يول', 'غشت', 'شت', 'أكت', 'نون', 'دجن']
function monthLabel(ym: string) { const m = parseInt(ym.slice(5), 10); return AR_MONTHS[(m - 1) % 12] }

function useCountUp(target: number, dur = 1000) {
  const [v, setV] = useState(0)
  useEffect(() => {
    let raf = 0; const t0 = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur)
      setV(target * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, dur])
  return v
}
function Num({ value, money }: { value: number; money?: boolean }) {
  const v = useCountUp(value)
  return <>{fmt(v)}{money ? ' د.م' : ''}</>
}

export default function OwnerCommandCenter({ embedded = false }: { embedded?: boolean }) {
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

  const today = new Date().toLocaleDateString('ar-MA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const maxTrend = Math.max(1, ...trend.map(p => p.mad))
  const totalEnroll = ov ? Object.values(ov.enroll || {}).reduce((a, b) => a + Number(b), 0) : 0
  let delay = 0
  const rise = () => ({ className: 'cc-rise', style: { animationDelay: `${(delay += 60)}ms` } })

  return (
    <div dir="rtl" className={embedded ? 'bg-[#faf6ef] rounded-3xl border border-[#e7dcc8]' : 'min-h-screen bg-[#faf6ef]'}>
      <div className={embedded ? 'w-full px-3 lg:px-5 py-5' : 'w-full max-w-[1700px] mx-auto px-4 lg:px-8 py-6'}>

        {/* ── HERO ── */}
        <div className="relative overflow-hidden rounded-3xl text-white p-5 lg:p-7 mb-5 shadow-lg"
          style={{ background: 'linear-gradient(120deg, #3a2817 0%, #2a1d12 55%, #5a3d1f 100%)' }}>
          <div className="absolute inset-0 cc-sheen pointer-events-none" />
          <div className="absolute -left-10 -top-10 w-48 h-48 rounded-full bg-white/10 blur-3xl cc-float" />
          <div className="absolute -right-8 -bottom-12 w-56 h-56 rounded-full bg-amber-400/15 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-white/80 text-[12px] font-bold mb-1.5">
                <Crown size={14} className="text-yellow-300" /> مركز قيادة المالك
              </div>
              <h1 className="text-white text-xl lg:text-[24px] font-black tracking-tight leading-tight">
                كل أعمالك في 60 ثانية
              </h1>
              <p className="text-white/70 text-[12.5px] mt-1.5">{today} · الإيرادات · الطلاب · الفريق · المخاطر</p>
            </div>
            <div className="flex items-center gap-3">
              {ov && (
                <div className="text-left bg-white/10 backdrop-blur rounded-2xl px-4 py-2.5">
                  <div className="text-[11px] text-white/70 font-semibold">الإيراد الإجمالي</div>
                  <div className="text-xl lg:text-2xl font-black text-yellow-300"><Num value={ov.rev_total} money /></div>
                </div>
              )}
              <button onClick={load} disabled={loading}
                className="w-11 h-11 rounded-2xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition disabled:opacity-50 backdrop-blur">
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </div>

        {loading && !ov && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-28 rounded-2xl bg-zinc-100 animate-pulse" />)}
          </div>
        )}

        {/* ── SMART ALERTS ── */}
        {alerts.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-2.5 mb-5">
            {alerts.map((a, i) => (
              <div key={i} style={{ animationDelay: `${(delay += 60)}ms` }} className={[
                'cc-rise flex items-center gap-2.5 px-4 py-3 rounded-2xl text-[13.5px] font-bold border shadow-sm',
                a.level === 'danger' ? 'bg-red-50 text-red-700 border-red-200'
                  : a.level === 'warn' ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200',
              ].join(' ')}>
                <span className="w-8 h-8 rounded-xl bg-white/70 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={16} />
                </span>
                <span className="leading-snug">{a.text}</span>
              </div>
            ))}
          </div>
        )}

        {ov && (
          <>
            {/* ── REVENUE KPI ROW ── */}
            <SectionLabel icon={Wallet}>الإيرادات</SectionLabel>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
              <BigKpi {...rise()} href="/admin/analytics" label="إيراد اليوم"  value={ov.rev_today}  money hero />
              <BigKpi {...rise()} href="/admin/analytics" label="هذا الأسبوع"   value={ov.rev_week}  money />
              <BigKpi {...rise()} href="/admin/analytics" label="هذا الشهر"     value={ov.rev_month} money />
              <BigKpi {...rise()} href="/admin/analytics" label="هذه السنة"     value={ov.rev_year}  money />
            </div>

            {/* ── REVENUE CHART + CONVERSION DONUT ── */}
            <div className="grid lg:grid-cols-3 gap-3 mb-6">
              <Panel {...rise()} className="lg:col-span-2">
                <PanelHead icon={TrendingUp} title="اتجاه الإيراد · آخر 6 أشهر" href="/admin/analytics" />
                <div className="flex items-end justify-between gap-2 lg:gap-4 h-48 px-1 pt-4">
                  {trend.map((p, i) => {
                    const h = Math.max(6, (p.mad / maxTrend) * 150)
                    const top = i === trend.length - 1
                    return (
                      <div key={p.month} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="text-[11px] font-black text-zinc-700 opacity-0 group-hover:opacity-100 transition">{fmt(p.mad)}</div>
                        <div className="w-full flex items-end justify-center" style={{ height: 150 }}>
                          <div className="cc-bar w-full max-w-[46px] rounded-t-xl transition-all group-hover:brightness-105"
                            style={{ height: h, background: top ? 'linear-gradient(to top,#a16207,#facc15)' : 'linear-gradient(to top,#8a6d4f,#cbb89c)', animationDelay: `${i * 80}ms` }} />
                        </div>
                        <span className={`text-[11px] font-bold ${top ? 'text-amber-600' : 'text-zinc-400'}`}>{monthLabel(p.month)}</span>
                      </div>
                    )
                  })}
                </div>
              </Panel>

              <Panel {...rise()}>
                <PanelHead icon={Target} title="نسبة التحويل" />
                <div className="flex flex-col items-center justify-center py-2">
                  <Donut value={ov.conversion_rate} />
                  <div className="grid grid-cols-2 gap-2 w-full mt-4">
                    <MiniStat label="طلاب يدفعون" value={<Num value={ov.paying_students} />} />
                    <MiniStat label="متوسط/طالب" value={<Num value={ov.arpu} money />} />
                  </div>
                </div>
              </Panel>
            </div>

            {/* ── STUDENTS + TODAY ── */}
            <SectionLabel icon={Users}>الطلاب اليوم</SectionLabel>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
              <BigKpi {...rise()} href="/sales/leads"    label="عملاء جدد اليوم"  value={ov.new_leads_today}    plainIcon={UserPlus} />
              <BigKpi {...rise()} href="/sales/students" label="طلاب جدد اليوم"   value={ov.new_students_today} plainIcon={Sparkles} />
              <BigKpi {...rise()} href="/sales/students" label="نشِطون"            value={ov.active_students}    plainIcon={Activity} tone="good" />
              <BigKpi {...rise()} href="/sales/students" label="في خطر (7 أيام+)"  value={ov.at_risk}            plainIcon={AlertTriangle} tone={ov.at_risk > 0 ? 'bad' : undefined} />
            </div>

            {/* ── ENROLLMENT TYPES ── */}
            <Panel {...rise()} className="mb-6">
              <PanelHead icon={Users} title="أنواع التسجيل" hint="الإيراد يُحتسب فقط من «مدفوع»" href="/sales/students" />
              <div className="space-y-2.5 mt-1">
                {ENROLLMENT_TYPES.map(t => {
                  const c = Number(ov.enroll?.[t.id] ?? 0)
                  const pct = totalEnroll > 0 ? Math.round((c / totalEnroll) * 100) : 0
                  return (
                    <div key={t.id} className="flex items-center gap-3">
                      <div className="w-28 flex items-center gap-1.5 text-[13px] font-bold text-zinc-700 flex-shrink-0">
                        <span>{t.emoji}</span> {t.label}
                      </div>
                      <div className="flex-1 h-7 rounded-lg bg-zinc-100 overflow-hidden relative">
                        <div className="cc-bar h-full rounded-lg" style={{ width: `${Math.max(pct, c > 0 ? 6 : 0)}%`, transformOrigin: 'right', background: t.id === 'paid' ? 'linear-gradient(to left,#3a2817,#facc15)' : 'linear-gradient(to left,#8a6d4f,#cbb89c)' }} />
                      </div>
                      <div className="w-16 text-left text-[13px] font-black text-zinc-900 flex-shrink-0">{c} <span className="text-[11px] text-zinc-400">({pct}%)</span></div>
                    </div>
                  )
                })}
              </div>
            </Panel>
          </>
        )}

        {/* ── TEAM PERFORMANCE ── */}
        <SectionLabel icon={Trophy}>أداء الفريق</SectionLabel>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3 mb-6">
          {team.length === 0 ? <Panel><Empty>لا يوجد مساعدون بعد.</Empty></Panel> :
            team.map((m, i) => {
              const conv = m.leads_handled > 0 ? Math.round((m.paid_students / m.leads_handled) * 100) : 0
              const rankCls = i === 0 ? 'bg-yellow-400 text-black' : i === 1 ? 'bg-zinc-300 text-zinc-700' : i === 2 ? 'bg-amber-700 text-white' : 'bg-zinc-200 text-zinc-500'
              return (
                <Link key={m.id} href="/sales/leads" {...rise()} className={`block rounded-2xl bg-white border border-zinc-200 p-4 lg:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all ${i === 0 ? 'ring-1 ring-yellow-300' : ''}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative">
                      <PersonAvatar name={m.name} size={42} />
                      <span className={`absolute -bottom-1 -left-1 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center ring-2 ring-white ${rankCls}`}>{i + 1}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="font-black text-[14px] text-zinc-900 truncate">{m.name}</div>
                      <div className="text-[11px] text-zinc-400 font-semibold">{m.leads_handled} عميل · {m.students_added} طالب</div>
                    </div>
                    <div className="mr-auto text-left">
                      <div className="text-[11px] text-zinc-400 font-semibold">الإيراد</div>
                      <div className="text-[15px] font-black text-amber-700">{fmt(m.revenue)}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <MiniStat label="مؤكّد" value={m.confirmed} />
                    <MiniStat label="مدفوع" value={m.paid_students} />
                    <MiniStat label="متأخرة" value={m.followups_overdue} tone={m.followups_overdue > 0 ? 'bad' : undefined} />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-zinc-400 mb-1"><span>نسبة التحويل</span><span className="text-zinc-700">{conv}%</span></div>
                    <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
                      <div className="cc-bar h-full rounded-full bg-gradient-to-l from-[#3a2817] to-[#facc15]" style={{ width: `${conv}%`, transformOrigin: 'right' }} />
                    </div>
                  </div>
                </Link>
              )
            })}
        </div>

        {/* ── STUDENT INTELLIGENCE ── */}
        {intel && (
          <>
            <SectionLabel icon={Zap}>ذكاء الطلاب</SectionLabel>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
              <BigKpi {...rise()} href="/sales/students" label="خامل 3–7 أيام"  value={intel.inactive_3} compact />
              <BigKpi {...rise()} href="/sales/students" label="خامل 7–14 يوم"  value={intel.inactive_7} compact tone={intel.inactive_7 > 0 ? 'warn' : undefined} />
              <BigKpi {...rise()} href="/sales/students" label="خامل 14–30 يوم" value={intel.inactive_14} compact tone={intel.inactive_14 > 0 ? 'bad' : undefined} />
              <BigKpi {...rise()} href="/sales/students" label="خامل 30 يوم +"  value={intel.inactive_30} compact tone={intel.inactive_30 > 0 ? 'bad' : undefined} />
            </div>
            <div className="grid lg:grid-cols-3 gap-3 mb-6">
              <Panel {...rise()}>
                <PanelHead icon={AlertTriangle} title="طلاب في خطر" />
                {intel.at_risk_list.length === 0 ? <Empty>لا أحد في خطر 🎉</Empty> :
                  <div className="space-y-0.5 mt-1">
                    {intel.at_risk_list.slice(0, 8).map(s => (
                      <Link key={s.id} href={`/sales/students/${s.id}`} className="flex items-center gap-2.5 py-1.5 px-1 -mx-1 rounded-lg hover:bg-zinc-50 transition-colors border-b border-zinc-50 last:border-0">
                        <PersonAvatar name={s.name} size={30} />
                        <span className="flex-1 text-[13px] font-semibold text-zinc-700 truncate">{s.name}</span>
                        <span className={[
                          'text-[11px] font-black px-2.5 py-1 rounded-full flex-shrink-0',
                          s.risk === 'high' ? 'bg-red-100 text-red-700' : s.risk === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-zinc-100 text-zinc-500',
                        ].join(' ')}>{s.days} يوم</span>
                      </Link>
                    ))}
                  </div>}
              </Panel>
              <Panel {...rise()}>
                <PanelHead icon={CoinIcon} title="الأعلى عملات" />
                {intel.top_coins.length === 0 ? <Empty>—</Empty> :
                  <div className="space-y-0.5 mt-1">
                    {intel.top_coins.slice(0, 8).map((s, i) => (
                      <Link key={s.id} href={`/sales/students/${s.id}`} className="flex items-center gap-2.5 py-1.5 px-1 -mx-1 rounded-lg hover:bg-zinc-50 transition-colors border-b border-zinc-50 last:border-0">
                        <span className="w-4 text-center text-[12px] font-black text-zinc-400 flex-shrink-0">{i + 1}</span>
                        <PersonAvatar name={s.name} size={30} />
                        <span className="flex-1 text-[13px] font-semibold text-zinc-700 truncate">{s.name}</span>
                        <span className="text-[13px] font-black text-yellow-600 flex-shrink-0 inline-flex items-center gap-1">{fmt(s.coins)} <CoinIcon size={14} /></span>
                      </Link>
                    ))}
                  </div>}
              </Panel>
              <Panel {...rise()}>
                <PanelHead icon={Flame} title="الأطول مواظبة" />
                {intel.top_streak.length === 0 ? <Empty>—</Empty> :
                  <div className="space-y-0.5 mt-1">
                    {intel.top_streak.slice(0, 8).map((s, i) => (
                      <Link key={s.id} href={`/sales/students/${s.id}`} className="flex items-center gap-2.5 py-1.5 px-1 -mx-1 rounded-lg hover:bg-zinc-50 transition-colors border-b border-zinc-50 last:border-0">
                        <span className="w-4 text-center text-[12px] font-black text-zinc-400 flex-shrink-0">{i + 1}</span>
                        <PersonAvatar name={s.name} size={30} />
                        <span className="flex-1 text-[13px] font-semibold text-zinc-700 truncate">{s.name}</span>
                        <span className="text-[13px] font-black text-orange-600 flex-shrink-0">{s.streak} 🔥</span>
                      </Link>
                    ))}
                  </div>}
              </Panel>
            </div>
          </>
        )}

        {/* ── COURSE ANALYTICS ── */}
        <SectionLabel icon={BookOpen}>تحليلات الدورات</SectionLabel>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3 mb-6">
          {courses.length === 0 ? <Panel><Empty>لا توجد دورات بعد.</Empty></Panel> :
            courses.map(c => {
              const eng = c.students > 0 ? Math.round((c.active_14d / c.students) * 100) : 0
              return (
                <Link key={c.id} href="/sales/courses" {...rise()} className="block rounded-2xl bg-white border border-zinc-200 p-4 lg:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="font-black text-[14px] text-zinc-900 truncate">{c.title}</div>
                    <Ring value={eng} />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <MiniStat label="طلاب" value={c.students} />
                    <MiniStat label="دروس" value={c.lessons} />
                    <MiniStat label="نشِط 14ي" value={c.active_14d} tone="good" />
                  </div>
                </Link>
              )
            })}
        </div>

        {/* rewards footer */}
        {ov && (
          <Panel {...rise()} className="mb-2">
            <PanelHead icon={CoinIcon} title="المكافآت" href="/sales/gamification" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-1">
              <MiniStat label="عملات موزّعة" value={fmt(ov.rewards.coins_distributed)} />
              <MiniStat label="عملات مصروفة" value={fmt(ov.rewards.coins_spent)} />
              <MiniStat label="طلبات معلّقة" value={ov.rewards.claims_pending} tone={ov.rewards.claims_pending > 0 ? 'warn' : undefined} />
              <MiniStat label="إجمالي الطلبات" value={ov.rewards.claims_total} />
            </div>
          </Panel>
        )}
      </div>
    </div>
  )
}

/* ════════ presentational ════════ */
function SectionLabel({ icon: Icon, children }: { icon: any; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3 mt-1">
      <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center"><Icon size={14} /></span>
      <h2 className="text-[14px] font-black text-zinc-800">{children}</h2>
      <div className="flex-1 h-px bg-gradient-to-l from-zinc-200 to-transparent" />
    </div>
  )
}

function BigKpi({ label, value, money, hero, compact, tone, plainIcon: Icon, href, className, style }: {
  label: string; value: number; money?: boolean; hero?: boolean; compact?: boolean
  tone?: 'good' | 'bad' | 'warn'; plainIcon?: any; href?: string; className?: string; style?: React.CSSProperties
}) {
  const toneCls = hero ? 'text-white border-transparent'
    : tone === 'bad' ? 'bg-red-50 border-red-200'
    : tone === 'warn' ? 'bg-amber-50 border-amber-200'
    : tone === 'good' ? 'bg-emerald-50 border-emerald-200'
    : 'bg-white border-zinc-200'
  const heroBg = hero ? { background: 'linear-gradient(135deg,#3a2817,#2a1d12)' } : undefined
  const inner = (
    <>
      <div className={`flex items-center gap-1.5 text-[12px] font-bold ${hero ? 'text-white/85' : 'text-zinc-400'}`}>
        {Icon && <Icon size={13} />} {label}
        {href && <ChevronLeft size={13} className={`mr-auto ${hero ? 'text-white/50' : 'text-zinc-300'} group-hover:-translate-x-0.5 transition-transform`} />}
      </div>
      <div className={`font-black mt-1.5 ${compact ? 'text-xl lg:text-2xl' : 'text-[22px] lg:text-[26px]'} leading-none ${hero ? 'text-yellow-400' : tone === 'bad' ? 'text-red-600' : tone === 'good' ? 'text-emerald-600' : 'text-zinc-900'}`}>
        <Num value={value} money={money} />
      </div>
    </>
  )
  const cls = `group block rounded-2xl border p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all ${toneCls} ${className ?? ''}`
  if (href) return <Link href={href} className={cls} style={{ ...heroBg, ...style }}>{inner}</Link>
  return <div className={cls} style={{ ...heroBg, ...style }}>{inner}</div>
}

function Panel({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return <div className={`bg-white rounded-2xl border border-zinc-200 p-4 lg:p-5 shadow-sm ${className ?? ''}`} style={style}>{children}</div>
}
function PanelHead({ icon: Icon, title, hint, href }: { icon: any; title: string; hint?: string; href?: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <Icon size={15} className="text-zinc-400" />
      <span className="text-[13.5px] font-black text-zinc-800">{title}</span>
      {hint && <span className="text-[11px] text-zinc-400 font-semibold">{hint}</span>}
      {href && <Link href={href} className="mr-auto inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-700 hover:text-amber-900">التفاصيل <ChevronLeft size={13} /></Link>}
    </div>
  )
}
function MiniStat({ label, value, tone }: { label: string; value: React.ReactNode; tone?: 'good' | 'bad' | 'warn' }) {
  const c = tone === 'bad' ? 'text-red-600' : tone === 'good' ? 'text-emerald-600' : tone === 'warn' ? 'text-amber-600' : 'text-zinc-900'
  return (
    <div className="rounded-xl bg-zinc-50 px-3 py-2 text-center">
      <div className="text-[10.5px] text-zinc-400 font-bold mb-0.5">{label}</div>
      <div className={`text-[15px] font-black ${c}`}>{value}</div>
    </div>
  )
}
function Empty({ children }: { children: React.ReactNode }) {
  return <div className="text-[13px] text-zinc-400 py-6 text-center font-semibold">{children}</div>
}

/* SVG donut for conversion rate */
function Donut({ value }: { value: number }) {
  const v = useCountUp(value)
  const r = 52, c = 2 * Math.PI * r, off = c - (Math.min(100, v) / 100) * c
  return (
    <div className="relative w-[140px] h-[140px]">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={r} fill="none" stroke="#f4f4f5" strokeWidth="13" />
        <circle cx="65" cy="65" r={r} fill="none" stroke="url(#cc-grad)" strokeWidth="13" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off} />
        <defs>
          <linearGradient id="cc-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#fde047" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-zinc-900">{Math.round(v)}%</span>
        <span className="text-[11px] text-zinc-400 font-bold">عميل ← طالب</span>
      </div>
    </div>
  )
}

/* small engagement ring */
function Ring({ value }: { value: number }) {
  const r = 18, c = 2 * Math.PI * r, off = c - (Math.min(100, value) / 100) * c
  const col = value >= 50 ? '#10b981' : value >= 25 ? '#f59e0b' : '#ef4444'
  return (
    <div className="relative w-12 h-12 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={r} fill="none" stroke="#f4f4f5" strokeWidth="5" />
        <circle cx="22" cy="22" r={r} fill="none" stroke={col} strokeWidth="5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-zinc-700">{value}%</span>
    </div>
  )
}
