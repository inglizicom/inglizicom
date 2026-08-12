'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Wallet, Clock, CalendarDays, Loader2, Info, TrendingUp, Coins,
} from 'lucide-react'
import { useTeacher } from '@/lib/teacher-context'
import { fetchSessions, type ClassSession } from '@/lib/teachers'
import { Bar, Chip, Count, GRAD, Head, Panel, Rise, Stat } from '../_ds'
import { DEMO_SESSIONS, isTeacherDemo } from '../_demo'

/**
 * What the hours are worth.
 *
 * A teacher cannot set their own rate — the guard trigger on teacher_profiles
 * pins pay_model and hourly_rate_mad to whatever the founder wrote. So this
 * page never pretends to be an editor. It reads the rate, multiplies it by
 * hours actually taught, and shows the working, because a number you cannot
 * change is only trustworthy if you can see where it came from.
 *
 * Only `done` sessions count. A scheduled class is a promise, not income.
 */

const MONTH_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو',
                  'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر']

const PAY_LABEL: Record<string, string> = {
  hourly:    'بالساعة',
  per_class: 'لكل حصة',
  monthly:   'راتب شهري',
  none:      'غير محدد',
}

interface MonthBucket {
  key:     string
  label:   string
  classes: number
  minutes: number
  amount:  number | null
}

export default function TeacherEarningsPage() {
  const teacher = useTeacher()
  const [sessions, setSessions] = useState<ClassSession[]>([])
  const [loading, setLoading]   = useState(true)
  const [demo, setDemo]         = useState(false)

  useEffect(() => {
    let alive = true
    if (isTeacherDemo()) {
      setDemo(true); setSessions(DEMO_SESSIONS); setLoading(false); return
    }
    ;(async () => {
      const s = await fetchSessions(teacher.id, { status: 'done' })
      if (!alive) return
      setSessions(s); setLoading(false)
    })()
    return () => { alive = false }
  }, [teacher.id])

  const payModel = teacher.profile?.pay_model ?? 'none'
  const rate     = teacher.profile?.hourly_rate_mad ?? null
  // Only hourly can be derived from the data we hold. Per-class and monthly
  // depend on terms that live outside this table, so we show hours and stop.
  const canDerive = payModel === 'hourly' && rate != null && rate > 0

  const done = useMemo(
    () => sessions.filter(s => s.status === 'done'),
    [sessions],
  )

  const months = useMemo<MonthBucket[]>(() => {
    const map = new Map<string, MonthBucket>()
    // Twelve buckets ending this month, so an empty month reads as a gap
    // rather than silently vanishing from the series.
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      map.set(key, {
        key,
        label: `${MONTH_AR[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`,
        classes: 0, minutes: 0, amount: canDerive ? 0 : null,
      })
    }
    for (const s of done) {
      const d = new Date(s.starts_at)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      const b = map.get(key)
      if (!b) continue
      b.classes += 1
      b.minutes += s.duration_min
      if (canDerive) b.amount = Math.round((b.minutes / 60) * (rate as number))
    }
    return [...map.values()]
  }, [done, canDerive, rate])

  const thisMonth = months[months.length - 1]
  const lastMonth = months[months.length - 2]

  const totalMinutes = done.reduce((a, s) => a + s.duration_min, 0)
  const totalHours   = Math.round((totalMinutes / 60) * 10) / 10
  const totalAmount  = canDerive ? Math.round((totalMinutes / 60) * (rate as number)) : null

  const monthHours  = thisMonth ? Math.round((thisMonth.minutes / 60) * 10) / 10 : 0
  const monthAmount = thisMonth?.amount ?? null

  const delta = lastMonth && lastMonth.minutes > 0 && thisMonth
    ? Math.round(((thisMonth.minutes - lastMonth.minutes) / lastMonth.minutes) * 100)
    : undefined

  const peak = Math.max(1, ...months.map(m => m.minutes))

  if (loading) {
    return (
      <div className="py-40 flex items-center justify-center gap-3 text-[#A8A29E]">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-[13px] font-medium">جاري تحميل أرباحك…</span>
      </div>
    )
  }

  return (
    <div className="space-y-5">

      {demo && (
        <Rise>
          <div className="flex items-center gap-2.5 rounded-2xl bg-fuchsia-50 ring-1 ring-fuchsia-200 px-4 py-2.5">
            <Coins size={15} className="text-fuchsia-600 shrink-0" />
            <span className="text-[12.5px] font-medium text-fuchsia-800">معاينة ببيانات وهمية — لا شيء هنا حقيقي.</span>
            <a href="?demo=0" className="mr-auto text-[12px] font-bold text-fuchsia-700 hover:text-[#1C1917] transition-colors">إيقاف</a>
          </div>
        </Rise>
      )}

      {/* ═══ The rate, stated plainly ═══ */}
      <Rise>
        <Panel glow="emerald" className="p-6 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <Chip tone="ok">{PAY_LABEL[payModel]}</Chip>
                {canDerive && <Chip tone="muted">{rate!.toLocaleString('en-US')} درهم / ساعة</Chip>}
              </div>
              <h1 className="text-[30px] sm:text-[38px] font-bold tracking-tight leading-[1.1]">
                {canDerive ? (
                  <>
                    <Count value={monthAmount ?? 0} className="bg-gradient-to-l from-[#10B981] to-[#047857] bg-clip-text text-transparent" />
                    <span className="text-[20px] text-[#78716C] font-semibold"> درهم</span>
                  </>
                ) : (
                  <><Count value={monthHours} decimals={1} /><span className="text-[20px] text-[#78716C] font-semibold"> ساعة</span></>
                )}
              </h1>
              <p className="text-[#78716C] text-[14px] font-medium mt-2.5">
                {canDerive ? 'تقدير هذا الشهر' : 'ساعات هذا الشهر'}
                <span className="text-[#A8A29E]"> · {thisMonth?.classes ?? 0} حصة منتهية</span>
              </p>
            </div>

            {canDerive && (
              <div className="text-right shrink-0">
                <div className="text-[11px] font-medium text-[#A8A29E] mb-1">الحساب</div>
                <div className="text-[13px] font-semibold text-[#57534E] tabular-nums" dir="ltr">
                  {monthHours} h × {rate!.toLocaleString('en-US')} MAD
                </div>
              </div>
            )}
          </div>

          {!canDerive && (
            <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-[#FBFAF7] ring-1 ring-[#E7E2D8] px-4 py-3">
              <Info size={15} className="text-[#78716C] shrink-0 mt-0.5" />
              <p className="text-[12.5px] text-[#78716C] font-medium leading-relaxed">
                {payModel === 'none'
                  ? 'لم تُحدَّد طريقة دفع بعد. ساعاتك محفوظة كاملة، وستُحتسب فور تحديدها.'
                  : `طريقة دفعك «${PAY_LABEL[payModel]}» تُحتسب خارج هذه اللوحة. ما نعرضه هنا هو ساعاتك وحصصك المؤكدة.`}
                <br />
                <span className="text-[#A8A29E]">الأجر يحدده المكتب — لا يمكن تعديله من هنا.</span>
              </p>
            </div>
          )}
        </Panel>
      </Rise>

      {/* ═══ The four figures ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 [&>*]:min-w-0">
        <Stat i={0} icon={Clock} grad="emerald" label="ساعات هذا الشهر" value={monthHours} decimals={1}
              delta={delta}
              foot={<span className="text-[10.5px] text-[#A8A29E] font-medium">{thisMonth?.classes ?? 0} حصة</span>} />
        <Stat i={1} icon={CalendarDays} grad="sky" label="حصص منتهية" value={done.length}
              foot={<span className="text-[10.5px] text-[#A8A29E] font-medium">منذ البداية</span>} />
        <Stat i={2} icon={TrendingUp} grad="violet" label="مجموع الساعات" value={totalHours} decimals={1}
              foot={<span className="text-[10.5px] text-[#A8A29E] font-medium">منذ البداية</span>} />
        <Stat i={3} icon={Wallet} grad="amber" label={canDerive ? 'مجموع الأرباح' : 'في انتظار التسعير'}
              value={totalAmount ?? 0} suffix={canDerive ? ' د' : ''}
              foot={<span className="text-[10.5px] text-[#A8A29E] font-medium">
                {canDerive ? 'تقدير تراكمي' : 'حدّد المكتب الأجر لاحقاً'}
              </span>} />
      </div>

      {/* ═══ Twelve months ═══ */}
      <Rise>
        <Panel className="p-5 sm:p-6">
          <Head icon={TrendingUp} grad="emerald" title="آخر اثني عشر شهراً"
                note={canDerive ? 'الساعات والمقابل المقدّر' : 'الساعات المنتهية شهراً بشهر'} />

          {done.length === 0 ? (
            <div className="py-12 text-center">
              <Wallet size={26} className="mx-auto text-[#C7C2BA] mb-2.5" />
              <p className="text-[13px] font-semibold text-[#78716C]">لا حصص منتهية بعد</p>
              <p className="text-[11.5px] text-[#C7C2BA] mt-1">تُحتسب الساعة بمجرد أن تُنهي الحصة.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {months.map((m, i) => {
                const hours = Math.round((m.minutes / 60) * 10) / 10
                const isNow = i === months.length - 1
                return (
                  <div key={m.key} className="flex items-center gap-3.5">
                    <div className={`w-[74px] shrink-0 text-[11.5px] font-semibold tabular-nums ${
                      isNow ? 'text-[#1C1917]' : 'text-[#A8A29E]'}`}>
                      {m.label}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Bar pct={(m.minutes / peak) * 100} grad={isNow ? 'emerald' : 'sky'} height={8} />
                    </div>
                    <div className="w-[52px] shrink-0 text-left text-[11.5px] font-bold tabular-nums text-[#57534E]">
                      {hours ? `${hours}س` : '—'}
                    </div>
                    {canDerive && (
                      <div className="w-[72px] shrink-0 text-left text-[11.5px] font-bold tabular-nums text-emerald-700">
                        {m.amount ? m.amount.toLocaleString('en-US') : '—'}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </Panel>
      </Rise>

      {/* ═══ The classes behind the number ═══ */}
      {thisMonth && thisMonth.classes > 0 && (
        <Rise>
          <Panel className="p-5 sm:p-6">
            <Head icon={CalendarDays} grad="sky" title="حصص هذا الشهر"
                  note="كل حصة منتهية دخلت في الحساب أعلاه" />
            <div className="space-y-2">
              {done
                .filter(s => {
                  const d = new Date(s.starts_at)
                  const n = new Date()
                  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth()
                })
                .sort((a, b) => +new Date(b.starts_at) - +new Date(a.starts_at))
                .map(s => (
                  <div key={s.id}
                       className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#FBFAF7] ring-1 ring-[#E7E2D8]">
                    <div className={`w-1 h-9 rounded-full shrink-0 bg-gradient-to-b ${GRAD.emerald}`} />
                    <div className="w-14 text-center shrink-0">
                      <div className="text-[10px] font-medium text-[#A8A29E]">
                        {new Date(s.starts_at).toLocaleDateString('ar-MA', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[13.5px] truncate">{s.title}</div>
                      <div className="text-[10.5px] text-[#A8A29E] font-medium mt-0.5">{s.duration_min} دقيقة</div>
                    </div>
                    {canDerive && (
                      <div className="text-[12.5px] font-bold tabular-nums text-emerald-700 shrink-0">
                        {Math.round((s.duration_min / 60) * (rate as number)).toLocaleString('en-US')} د
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </Panel>
        </Rise>
      )}
    </div>
  )
}
