'use client'

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Activity, Users, Wallet, Radio, ShieldAlert, DatabaseZap } from 'lucide-react'
import { ErrorNote } from '@/components/crm/kit'
import { fetchTeam, fetchTeamBasic, isMissingFunction, type TeamMember } from '@/lib/founder'
import { businessToday, addDays } from '@/lib/enrollment-metrics'
import { useStaff } from '@/lib/staff-context'
import TeamTab from './TeamTab'
import PayrollTab from './PayrollTab'
import ActivityTab from './ActivityTab'
import { isOnline } from './_shared'

/**
 * الفريق والرواتب — the founder's control room.
 *
 *   الفريق       who works here, what each did in the period, block / unblock,
 *                an assistant's monthly salary
 *   الرواتب      the month's pay for every assistant and teacher: suggested,
 *                adjusted, recorded as paid, announced on WhatsApp
 *   سجل النشاط   every staff move the database recorded, with what changed
 *
 * Founder only: the RPCs refuse anyone else, and the page says so instead of
 * showing empty cards.
 */
type Tab = 'team' | 'payroll' | 'activity'
const TABS: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: 'team', label: 'الفريق', icon: Users },
  { id: 'payroll', label: 'الرواتب', icon: Wallet },
  { id: 'activity', label: 'سجل النشاط', icon: Activity },
]
const PERIODS: { id: string; label: string }[] = [
  { id: 'today', label: 'اليوم' }, { id: '7d', label: '7 أيام' }, { id: 'month', label: 'هذا الشهر' }, { id: '30d', label: '30 يومًا' },
]

export default function TeamPage() {
  return <Suspense fallback={null}><Team /></Suspense>
}

function Team() {
  const me = useStaff()
  const router = useRouter()
  const pathname = usePathname() ?? '/admin/team'
  const sp = useSearchParams()
  const tab = (sp.get('tab') as Tab) || 'team'
  const actor = sp.get('actor') ?? ''
  const [period, setPeriod] = useState('month')
  const [people, setPeople] = useState<TeamMember[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // 057 not on this database yet: list the team from profiles, hide what needs it.
  const [limited, setLimited] = useState(false)

  const today = businessToday()
  const range = useMemo(() => {
    if (period === 'today') return { from: today, to: today }
    if (period === '7d') return { from: addDays(today, -6), to: today }
    if (period === '30d') return { from: addDays(today, -29), to: today }
    return { from: today.slice(0, 8) + '01', to: today }
  }, [period, today])

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try { setPeople(await fetchTeam(range.from, range.to)); setLimited(false) }
    catch (e: any) {
      if (isMissingFunction(e)) {
        setLimited(true)
        try { setPeople(await fetchTeamBasic()) } catch (e2: any) { setError(e2?.message ?? 'تعذّر تحميل الفريق') }
      } else setError(e?.message ?? 'تعذّر تحميل الفريق')
    }
    finally { setLoading(false) }
  }, [range.from, range.to])
  useEffect(() => { load() }, [load])

  function go(next: Tab, extra: Record<string, string> = {}) {
    const q = new URLSearchParams({ tab: next, ...extra })
    router.replace(`${pathname}?${q.toString()}`, { scroll: false })
  }

  if (me.role !== 'founder') {
    return (
      <div className="px-4 py-16 text-center">
        <ShieldAlert className="mx-auto text-zinc-300 mb-3" size={32} />
        <p className="text-[14px] font-bold text-zinc-600">هذه الصفحة للمؤسس فقط.</p>
      </div>
    )
  }

  const list = people ?? []
  const assistants = list.filter(p => p.role === 'assistant')
  const teachers = list.filter(p => p.role === 'teacher')
  const online = list.filter(p => isOnline(p.last_seen_at))
  const actions = list.filter(p => p.role !== 'teacher').reduce((s, p) => s + p.actions, 0)

  return (
    <div className="px-4 lg:px-8 py-5 lg:py-6 max-w-[1400px] mx-auto space-y-5">
      {/* header */}
      <header className="relative overflow-hidden rounded-[24px] text-white p-5 lg:p-6 shadow-md"
              style={{ background: 'linear-gradient(120deg, #1E3A8A 0%, #1E40AF 55%, #2563EB 100%)' }}>
        <div className="absolute -left-12 -top-14 w-56 h-56 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="relative">
          <h1 className="text-[22px] lg:text-[26px] font-extrabold tracking-tight text-inherit">الفريق والرواتب</h1>
          <p className="text-[13px] text-white/75 mt-1">من يعمل، ماذا فعل كل واحد، وكم يتقاضى — في مكان واحد.</p>
          <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            <HeroStat icon={Users} label="المساعدون" value={assistants.length} />
            <HeroStat icon={Users} label="الأساتذة" value={teachers.length} />
            <HeroStat icon={Radio} label="متصلون الآن" value={online.length} note={online.map(p => p.name).slice(0, 2).join('، ')} />
            <HeroStat icon={Activity} label="إجراءات الفريق" value={actions} note={PERIODS.find(p => p.id === period)?.label} />
          </div>
        </div>
      </header>

      {/* tabs + period */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-white border border-zinc-200 shadow-sm sm:w-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => go(t.id)}
                    className={`flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-xl text-[13px] font-bold transition-colors whitespace-nowrap
                                ${tab === t.id ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}>
              <t.icon size={15} className="hidden sm:block shrink-0" /> {t.label}
            </button>
          ))}
        </div>
        {tab === 'team' && (
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {PERIODS.map(p => (
              <button key={p.id} onClick={() => setPeriod(p.id)}
                      className={`px-3 py-2 rounded-lg text-[12px] font-bold whitespace-nowrap transition-colors
                                  ${period === p.id ? 'bg-yellow-400 text-black' : 'bg-white border border-zinc-200 text-zinc-600 hover:border-blue-300'}`}>
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {limited && (
        <div className="flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3.5">
          <DatabaseZap size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-[12.5px] text-amber-900 leading-relaxed">
            <b>قاعدة البيانات لم تُحدَّث بعد.</b> الفريق ظاهر وتستطيع الإضافة والإزالة، لكن تتبّع النشاط والرواتب والإيقاف
            تعمل بعد تشغيل <bdi dir="ltr">057_founder_control.sql</bdi> في Supabase.
          </div>
        </div>
      )}
      <ErrorNote>{error}</ErrorNote>

      {tab === 'team' && (
        <TeamTab people={people} loading={loading} limited={limited} onChanged={load}
                 onShowActivity={id => go('activity', { actor: id })} />
      )}
      {tab === 'payroll' && <PayrollTab initialMonth={today.slice(0, 8) + '01'} />}
      {tab === 'activity' && (
        <ActivityTab people={people} actor={actor} onActor={id => go('activity', id ? { actor: id } : {})} />
      )}
    </div>
  )
}

function HeroStat({ icon: Icon, label, value, note }: { icon: typeof Users; label: string; value: number; note?: string }) {
  return (
    <div className="rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur px-3.5 py-3 min-w-0">
      <div className="flex items-center gap-1.5 text-[11.5px] font-bold text-white/75"><Icon size={13} /> {label}</div>
      <div className="text-[24px] font-extrabold text-amber-300 leading-tight">{value.toLocaleString('en-US')}</div>
      {note && <div className="text-[10.5px] text-white/60 truncate">{note}</div>}
    </div>
  )
}
