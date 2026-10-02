'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Trophy, Medal, Crown, Star, Users, Radio, Activity, CalendarCheck, Clock, Loader2, Info, Wallet, Lock, TrendingUp,
} from 'lucide-react'
import { useTeacher } from '@/lib/teacher-context'
import { fetchLeaderboard, type Leaderboard, type LeaderboardRow } from '@/lib/teachers'
import { businessToday } from '@/lib/enrollment-metrics'
import { Rise } from '../_ds'
import { DEMO_LEADERBOARD, isTeacherDemo } from '../_demo'
import { DemoBanner } from '../_ui'
import { Face, HelpBanner, SectionHead, StatusPill, Surface } from '../_kit'

/**
 * المنافسة — every active teacher on one board.
 *
 * Transparent on purpose: the score formula is printed on the page, and every
 * input to it (sessions, students, rating) is a column. What is NOT on the
 * board is money — another teacher's earnings or their students' payments are
 * private. The only money shown is the viewer's own students' payments,
 * marked as visible to them alone.
 */

type Period = 'month' | 'last' | 'year'
const PERIODS: [Period, string][] = [['month', 'هذا الشهر'], ['last', 'الشهر الماضي'], ['year', 'هذه السنة']]

function range(p: Period): [string | null, string | null] {
  const today = businessToday()                       // YYYY-MM-DD, Morocco
  const [y, m] = today.split('-').map(Number)
  const iso = (d: Date) => d.toISOString().slice(0, 10)
  if (p === 'month') return [null, null]              // the function defaults to this month
  if (p === 'year') return [`${y}-01-01`, today]
  const from = new Date(Date.UTC(y, m - 2, 1)), to = new Date(Date.UTC(y, m - 1, 0))
  return [iso(from), iso(to)]
}

const MEDAL = [
  { ring: 'from-amber-300 to-yellow-500', text: 'text-amber-700', bg: 'bg-amber-50', label: 'الأول' },
  { ring: 'from-slate-200 to-slate-400', text: 'text-slate-600', bg: 'bg-slate-50', label: 'الثاني' },
  { ring: 'from-orange-300 to-amber-700', text: 'text-orange-700', bg: 'bg-orange-50', label: 'الثالث' },
]

export default function LeaderboardPage() {
  const teacher = useTeacher()
  const [period, setPeriod] = useState<Period>('month')
  const [board, setBoard]   = useState<Leaderboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [demo, setDemo]     = useState(false)

  useEffect(() => {
    let alive = true
    if (isTeacherDemo()) { setDemo(true); setBoard(DEMO_LEADERBOARD); setLoading(false); return }
    setLoading(true)
    const [from, to] = range(period)
    fetchLeaderboard(from, to).then(b => { if (alive) { setBoard(b); setLoading(false) } })
    return () => { alive = false }
  }, [period, teacher.id])

  const rows = board?.rows ?? []
  const me = rows.find(r => r.is_me)
  const ahead = useMemo(() => (me ? rows.filter(r => r.rank < me.rank).sort((a, b) => a.score - b.score)[0] : undefined), [rows, me])
  const totalLive = rows.reduce((a, r) => a + r.live, 0)

  if (loading) {
    return <div className="py-40 flex justify-center text-[#94A3B8]"><Loader2 size={20} className="animate-spin" /></div>
  }
  if (!board) {
    return (
      <div className="py-24 text-center">
        <Trophy size={30} className="mx-auto text-[#CBD5E1] mb-3" />
        <div className="text-[16px] font-extrabold text-[#1E3A8A]">لوحة المنافسة غير متاحة بعد</div>
        <p className="mt-1 text-[13px] text-[#64748B]">ستظهر هنا فور تفعيلها من الإدارة.</p>
      </div>
    )
  }

  const toTop = me && !me.is_top_rated
    ? me.rating_count < 5 ? `${5 - me.rating_count} تقييمات إضافية` : `متوسط 4.5 (حالياً ${Number(me.rating_avg).toFixed(1)})`
    : null

  return (
    <div className="space-y-6">
      {demo && <DemoBanner />}

      {/* ══ Title + period ══ */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] sm:text-[28px] font-extrabold tracking-tight text-[#1E3A8A]">المنافسة بين الأساتذة 🏆</h1>
          <p className="mt-1 text-[14px] text-[#64748B]">ترتيب شفاف لكل الأساتذة — الحصص، الطلاب والتقييمات.</p>
        </div>
        <div className="inline-flex gap-1 bg-white ring-1 ring-[#D6DFEC] rounded-xl p-1 shadow-sm">
          {PERIODS.map(([id, label]) => (
            <button key={id} onClick={() => setPeriod(id)} disabled={demo}
                    className={`px-3.5 py-1.5 rounded-lg text-[12.5px] font-bold transition
                                ${period === id ? 'bg-blue-600 text-white shadow-sm' : 'text-[#64748B] hover:text-[#1E3A8A]'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ══ My position ══ */}
      {me && (
        <Rise>
          <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white shadow-[0_30px_60px_-30px_rgba(30,58,138,.6)]">
            <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 w-[360px] h-[360px] rounded-full bg-[radial-gradient(circle,rgba(251,191,36,.25),transparent_65%)]" />
            <div className="relative grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-4 sm:gap-6 items-center p-4 sm:p-7">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-400 to-yellow-500 text-blue-900 flex flex-col items-center justify-center shadow-lg shadow-amber-500/30">
                  <span className="text-[10px] sm:text-[12px] font-extrabold">ترتيبك</span>
                  <span className="text-[26px] sm:text-[38px] font-black leading-none tabular-nums">#{me.rank}</span>
                </div>
                <div>
                  <div className="text-[12px] sm:text-[13px] font-semibold text-blue-100">من <bdi>{rows.length}</bdi> أستاذ</div>
                  <div className="text-[24px] sm:text-[30px] font-extrabold leading-tight tabular-nums"><bdi>{me.score}</bdi> <span className="text-[13px] sm:text-[15px] text-blue-100">نقطة</span></div>
                  {me.is_top_rated
                    ? <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11.5px] font-bold text-amber-200"><Crown size={12} /> من الأفضل تقييماً</span>
                    : <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11.5px] font-bold text-blue-100"><Star size={12} /> لتصبح «الأفضل تقييماً»: {toTop}</span>}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5">
                {[
                  { icon: Users, label: 'طلاب حاليون', v: me.students },
                  { icon: Radio, label: 'متصلون الآن', v: me.live },
                  { icon: CalendarCheck, label: 'حصص منجزة', v: me.sessions },
                  { icon: Star, label: me.rating_count ? `${me.rating_count} تقييماً` : 'التقييم', v: me.rating_count ? Number(me.rating_avg).toFixed(1) : '—' },
                ].map(x => (
                  <div key={x.label} className="rounded-xl sm:rounded-2xl bg-white/10 ring-1 ring-white/15 px-1 py-2 sm:p-3 text-center">
                    <x.icon size={14} className="mx-auto text-amber-300" />
                    <div className="mt-1 text-[16px] sm:text-[20px] font-extrabold tabular-nums">{x.v}</div>
                    <div className="text-[9.5px] sm:text-[11px] font-bold leading-tight text-blue-100">{x.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 lg:grid-cols-1 lg:w-[220px] lg:gap-2.5">
                {ahead ? (
                  <div className="rounded-2xl bg-white/10 ring-1 ring-white/15 p-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-100"><TrendingUp size={13} className="text-emerald-300" /> للتقدّم مركزاً</div>
                    <div className="mt-1 text-[14px] font-extrabold">{ahead.score - me.score + 1} نقطة</div>
                    <div className="text-[11.5px] text-blue-100">≈ {Math.ceil((ahead.score - me.score + 1) / 10)} حصص منجزة</div>
                  </div>
                ) : (
                  <div className="flex items-center rounded-2xl bg-white/10 ring-1 ring-white/15 p-3 text-[12px] sm:text-[13px] font-extrabold text-amber-200">أنت في الصدارة — حافظ عليها! 👑</div>
                )}
                {board.me && (
                  <div className="rounded-2xl bg-white text-[#1E3A8A] p-3">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-[#64748B]"><Wallet size={12} className="text-emerald-600" /> مدفوعات طلابك</div>
                    <div className="mt-1 text-[16px] sm:text-[18px] font-extrabold tabular-nums">{Number(board.me.roster_revenue).toLocaleString('en-US')} <span className="text-[12px] text-[#94A3B8]">درهم</span></div>
                    <div className="flex items-center gap-1 text-[10.5px] text-[#94A3B8]"><Lock size={10} /> {board.me.roster_paying_students} طالب · خاص بك</div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </Rise>
      )}

      {/* ══ Podium ══ */}
      {rows.length > 0 && (
        <div className={`grid items-end gap-2 sm:gap-4 ${rows.length >= 3 ? 'grid-cols-3' : 'grid-cols-1 sm:grid-cols-3'}`}>
          {rows.slice(0, 3).map((r, i) => (
            <Rise key={r.id} i={i} className={rows.length >= 3 ? (i === 0 ? 'order-2' : i === 1 ? 'order-1' : 'order-3') : ''}>
              <Surface className={`px-2 pb-3 text-center h-full sm:px-5 sm:pb-5 ${i === 0 ? 'pt-5 sm:pt-8' : 'pt-3 sm:pt-5'} ${r.is_me ? '!ring-2 !ring-blue-500' : ''}`}>
                <div className={`mx-auto w-fit rounded-full bg-gradient-to-br ${MEDAL[i].ring} p-0.5 sm:p-1 shadow-md [&>*]:!h-11 [&>*]:!w-11 sm:[&>*]:!h-[72px] sm:[&>*]:!w-[72px]`}>
                  <Face name={r.name ?? 'أستاذ'} url={r.avatar_url} size={72} className="ring-2 sm:ring-4 ring-white" />
                </div>
                <div className={`mt-2 sm:mt-3 inline-flex items-center gap-1 rounded-full ${MEDAL[i].bg} px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-[11.5px] font-extrabold ${MEDAL[i].text}`}>
                  {i === 0 ? <Trophy size={11} /> : <Medal size={11} />} {MEDAL[i].label}
                </div>
                <div className="mt-1.5 sm:mt-2 text-[12.5px] sm:text-[15px] font-extrabold text-[#1E3A8A] truncate">{r.name ?? 'أستاذ'}{r.is_me && ' (أنت)'}</div>
                <div className="hidden sm:block text-[12px] text-[#64748B] truncate">{r.headline ?? '—'}</div>
                <div className="mt-1 sm:mt-3 text-[17px] sm:text-[26px] font-black text-[#1E3A8A] tabular-nums">{r.score} <span className="text-[10px] sm:text-[12px] font-bold text-[#94A3B8]">نقطة</span></div>
                <div className="mt-1 sm:mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 sm:gap-3 text-[10.5px] sm:text-[12px] font-bold text-[#475569]">
                  <span className="inline-flex items-center gap-1"><Users size={13} className="text-blue-600" /> {r.students}</span>
                  <span className="inline-flex items-center gap-1"><CalendarCheck size={13} className="text-emerald-600" /> {r.sessions}</span>
                  <span className="inline-flex items-center gap-1"><Star size={13} className="text-amber-400" fill="currentColor" /> {r.rating_count ? Number(r.rating_avg).toFixed(1) : '—'}</span>
                </div>
                {r.is_top_rated && <div className="mt-2 sm:mt-3"><span className="sm:hidden text-[14px]" aria-label="من الأفضل تقييماً">👑</span><span className="hidden sm:inline"><StatusPill tone="warn">⭐ من الأفضل تقييماً</StatusPill></span></div>}
              </Surface>
            </Rise>
          ))}
        </div>
      )}

      {/* ══ Full ranking ══ */}
      <Rise>
        <Surface className="p-5 sm:p-6">
          <SectionHead title="الترتيب الكامل" action={
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-[12px] font-bold text-emerald-700 ring-1 ring-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> {totalLive} طالب متصل الآن
            </span>} />
          <ol className="sm:hidden -mx-1 divide-y divide-[#EEF2F7]">
            {rows.map(r => (
              <li key={r.id} className={`flex items-center gap-2.5 px-1 py-2.5 ${r.is_me ? 'rounded-xl bg-blue-50/70' : ''}`}>
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[12px] font-black
                                  ${r.rank === 1 ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-blue-900'
                                    : r.rank <= 3 ? 'bg-blue-100 text-blue-700' : 'bg-[#F1F5F9] text-[#64748B]'}`}>{r.rank}</span>
                <Face name={r.name ?? 'أستاذ'} url={r.avatar_url} size={34} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="truncate text-[13.5px] font-bold text-[#1E3A8A]">{r.name ?? 'أستاذ'}</span>
                    {r.is_me && <StatusPill tone="info">أنت</StatusPill>}
                    {r.is_top_rated && <Crown size={13} className="shrink-0 text-amber-500" />}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-[#64748B]">
                    <span>⭐ {r.rating_count ? Number(r.rating_avg).toFixed(1) : '—'}</span>
                    <span>👥 {r.students}</span>
                    {r.live > 0 && <span className="font-bold text-emerald-700">🟢 {r.live}</span>}
                    <span>📅 {r.sessions}</span>
                  </div>
                </div>
                <div className="shrink-0 text-center">
                  <div className="text-[15px] font-black tabular-nums text-[#1E3A8A]">{r.score}</div>
                  <div className="text-[10px] font-semibold text-[#94A3B8]">نقطة</div>
                </div>
              </li>
            ))}
          </ol>
          <div className="hidden sm:block overflow-x-auto -mx-5 sm:-mx-6">
            <table className="w-full min-w-[820px] text-[13px]">
              <thead>
                <tr className="bg-[#F8FAFC] text-right text-[12px] text-[#64748B]">
                  <th className="px-5 sm:px-6 py-3 font-bold w-14">#</th>
                  <th className="px-3 py-3 font-bold">الأستاذ</th>
                  <th className="px-3 py-3 font-bold">النقاط</th>
                  <th className="px-3 py-3 font-bold">التقييم</th>
                  <th className="px-3 py-3 font-bold">طلاب حاليون</th>
                  <th className="px-3 py-3 font-bold">متصلون الآن</th>
                  <th className="px-3 py-3 font-bold">نشطون (7 أيام)</th>
                  <th className="px-3 py-3 font-bold">حصص</th>
                  <th className="px-3 py-3 font-bold">ساعات</th>
                  <th className="px-5 sm:px-6 py-3 font-bold">الحضور</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF2F7]">
                {rows.map((r: LeaderboardRow) => (
                  <tr key={r.id} className={r.is_me ? 'bg-blue-50/70' : 'hover:bg-[#F8FAFC]'}>
                    <td className="px-5 sm:px-6 py-3">
                      <span className={`inline-flex w-8 h-8 items-center justify-center rounded-lg text-[13px] font-black
                                        ${r.rank === 1 ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-blue-900'
                                          : r.rank <= 3 ? 'bg-blue-100 text-blue-700' : 'bg-[#F1F5F9] text-[#64748B]'}`}>{r.rank}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <Face name={r.name ?? 'أستاذ'} url={r.avatar_url} size={34} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#1E3A8A] truncate max-w-[160px]">{r.name ?? 'أستاذ'}</span>
                            {r.is_me && <StatusPill tone="info">أنت</StatusPill>}
                            {r.is_top_rated && <Crown size={14} className="text-amber-500" aria-label="من الأفضل تقييماً" />}
                          </div>
                          <div className="text-[11.5px] text-[#94A3B8] truncate max-w-[200px]">{r.headline ?? ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 font-black text-[#1E3A8A] tabular-nums">{r.score}</td>
                    <td className="px-3 py-3">
                      {r.rating_count
                        ? <span className="inline-flex items-center gap-1 font-bold text-[#334155]"><Star size={13} className="text-amber-400" fill="currentColor" />{Number(r.rating_avg).toFixed(1)} <span className="text-[11px] text-[#94A3B8]">({r.rating_count})</span></span>
                        : <span className="text-[#CBD5E1]">—</span>}
                    </td>
                    <td className="px-3 py-3 font-bold text-[#334155] tabular-nums">{r.students}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center gap-1.5 font-bold tabular-nums ${r.live ? 'text-emerald-700' : 'text-[#CBD5E1]'}`}>
                        <span className={`w-2 h-2 rounded-full ${r.live ? 'bg-emerald-500 animate-pulse' : 'bg-[#E2E8F0]'}`} />{r.live}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-[#475569] tabular-nums">{r.active_7d}</td>
                    <td className="px-3 py-3 text-[#475569] tabular-nums">{r.sessions}</td>
                    <td className="px-3 py-3 text-[#475569] tabular-nums">{Number(r.hours)}</td>
                    <td className="px-5 sm:px-6 py-3 text-[#475569] tabular-nums">{r.attendance_rate != null ? `${Math.round(Number(r.attendance_rate))}%` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Surface>
      </Rise>

      {/* ══ How it works ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Rise>
          <Surface className="p-5 sm:p-6 h-full">
            <SectionHead title="كيف تُحتسب النقاط؟" />
            <ul className="space-y-3">
              {[
                { icon: CalendarCheck, t: '10 نقاط', d: 'لكل حصة منجزة في الفترة' },
                { icon: Users, t: '5 نقاط', d: 'لكل طالب حالي (مسنَد أو في أحد أقسامك)' },
                { icon: Star, t: 'التقييم × 20', d: 'بعد 3 تقييمات منشورة على الأقل' },
              ].map(x => (
                <li key={x.t} className="flex items-center gap-3 rounded-xl bg-[#F8FAFC] ring-1 ring-[#E2E8F0] p-3">
                  <span className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0"><x.icon size={16} /></span>
                  <span className="text-[14px] font-extrabold text-[#1E3A8A] w-24 shrink-0">{x.t}</span>
                  <span className="text-[12.5px] text-[#475569]">{x.d}</span>
                </li>
              ))}
            </ul>
          </Surface>
        </Rise>
        <Rise i={1}>
          <Surface className="p-5 sm:p-6 h-full">
            <SectionHead title="ما معنى كل رقم؟" />
            <ul className="space-y-2.5 text-[12.5px] text-[#475569] leading-relaxed">
              <li className="flex gap-2"><Crown size={15} className="text-amber-500 shrink-0 mt-0.5" /><span><b className="text-[#1E3A8A]">الأفضل تقييماً:</b> متوسط 4.5 فأكثر من 5 تقييمات على الأقل — نفس القاعدة في الصفحة العامة.</span></li>
              <li className="flex gap-2"><Radio size={15} className="text-emerald-600 shrink-0 mt-0.5" /><span><b className="text-[#1E3A8A]">متصلون الآن:</b> طلابك الذين فتحوا المنصة خلال آخر 15 دقيقة.</span></li>
              <li className="flex gap-2"><Activity size={15} className="text-blue-600 shrink-0 mt-0.5" /><span><b className="text-[#1E3A8A]">نشطون:</b> طلابك الذين درسوا على المنصة خلال آخر 7 أيام.</span></li>
              <li className="flex gap-2"><Clock size={15} className="text-indigo-600 shrink-0 mt-0.5" /><span><b className="text-[#1E3A8A]">الحصص والساعات:</b> الحصص المنجزة فقط في الفترة المختارة.</span></li>
              <li className="flex gap-2"><Info size={15} className="text-[#94A3B8] shrink-0 mt-0.5" /><span>أرباح الأساتذة الآخرين ومدفوعات طلابهم <b className="text-[#1E3A8A]">لا تظهر</b> هنا — المنافسة على جودة التدريس.</span></li>
            </ul>
          </Surface>
        </Rise>
      </div>

      <HelpBanner title="سؤال عن الترتيب؟" text="الإدارة تشرح طريقة الاحتساب وتراجع أي رقم تراه غير صحيح." />
    </div>
  )
}
