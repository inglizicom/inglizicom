'use client'

import { useState } from 'react'
import { Bell, BellOff, CalendarDays, Clock, Flame, MapPin, Users, UserRound, Video, Sparkles } from 'lucide-react'
import { BarChart, Ring } from '@/app/teacher/_charts'
import { SectionHead, StatusPill, Surface, type PillTone } from '@/app/teacher/_kit'
import { attendanceStats, upcomingSessions, type ClassMode, type SPSession, type StudentProfile } from '@/lib/student-profile'
import { fmtHour, fmtShort } from './overview'

const MODE: Record<ClassMode, { label: string; tone: PillTone; icon: typeof Users }> = {
  group:   { label: 'جماعية', tone: 'info', icon: Users },
  private: { label: 'فردية',  tone: 'warn', icon: UserRound },
  trial:   { label: 'تجريبية', tone: 'ok',  icon: Sparkles },
}
const SEAT: Record<string, { label: string; tone: PillTone }> = {
  active: { label: 'نشط', tone: 'ok' }, waitlisted: { label: 'انتظار', tone: 'warn' },
  completed: { label: 'أنهى', tone: 'muted' }, cancelled: { label: 'ملغى', tone: 'bad' },
}
const WEEK = [
  { n: 1, label: 'الإثنين' }, { n: 2, label: 'الثلاثاء' }, { n: 3, label: 'الأربعاء' },
  { n: 4, label: 'الخميس' }, { n: 5, label: 'الجمعة' }, { n: 6, label: 'السبت' }, { n: 0, label: 'الأحد' },
]

/** A session is joinable from 15 minutes before it starts until it ends. */
function joinable(s: SPSession) {
  const start = new Date(s.startsAt).getTime()
  const now = Date.now()
  return !!s.meetingUrl && now >= start - 15 * 60000 && now <= start + s.durationMin * 60000
}

/* ── Active classes ────────────────────────────────────── */

export function ActiveClasses({ p }: { p: StudentProfile }) {
  return (
    <Surface className="p-5 sm:p-6 h-full">
      <SectionHead title="الأقسام والحصص الحالية" />
      {p.classes.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-[#94A3B8]">ليس مسجّلاً في أي قسم بعد.</p>
      ) : (
        <ul className="space-y-3">
          {p.classes.map(c => {
            const m = MODE[c.mode]
            return (
              <li key={c.id} className="rounded-2xl ring-1 ring-[#E2E8F0] p-4 hover:ring-blue-200 transition">
                <div className="flex items-start gap-3">
                  <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white shadow-md
                                    ${c.mode === 'private' ? 'bg-gradient-to-br from-amber-400 to-yellow-500 !text-blue-900' : c.mode === 'trial' ? 'bg-gradient-to-br from-emerald-500 to-emerald-700' : 'bg-gradient-to-br from-blue-500 to-blue-700'}`}>
                    <m.icon size={19} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[14px] font-extrabold text-[#1E3A8A] truncate">{c.title}</span>
                      <StatusPill tone={m.tone}>{m.label}</StatusPill>
                      <StatusPill tone={SEAT[c.status].tone}>{SEAT[c.status].label}</StatusPill>
                    </div>
                    <div className="mt-1 text-[12px] text-[#64748B]">{c.teacher}{c.level ? ` · ${c.level}` : ''}{c.schedule ? ` · ${c.schedule}` : ''}</div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[12px] font-semibold text-[#475569]">
                    {c.sessionsDone != null ? `${c.sessionsDone} حصة منجزة` : '—'}
                    {c.nextAt && <span className="text-[#94A3B8]"> · القادمة {fmtShort(c.nextAt)} {fmtHour(c.nextAt)}</span>}
                  </span>
                  {c.meetingUrl
                    ? <a href={c.meetingUrl} target="_blank" rel="noopener noreferrer"
                         className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-[12px] font-bold text-blue-700 hover:bg-blue-100">
                        <Video size={13} /> رابط الحصة
                      </a>
                    : <span className="text-[11.5px] font-semibold text-[#94A3B8]">لا رابط بعد</span>}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Surface>
  )
}

/* ── Upcoming, grouped by day ──────────────────────────── */

export function UpcomingSchedule({ p }: { p: StudentProfile }) {
  const list = upcomingSessions(p).slice(0, 8)
  const groups = list.reduce<{ key: string; label: string; items: SPSession[] }[]>((acc, s) => {
    const d = new Date(s.startsAt)
    const key = d.toDateString()
    const today = new Date().toDateString()
    const tomorrow = new Date(Date.now() + 864e5).toDateString()
    const label = key === today ? 'اليوم' : key === tomorrow ? 'غداً' : d.toLocaleDateString('ar-MA', { weekday: 'long', day: 'numeric', month: 'long' })
    const g = acc.find(x => x.key === key)
    if (g) g.items.push(s); else acc.push({ key, label, items: [s] })
    return acc
  }, [])

  return (
    <Surface className="p-5 sm:p-6 h-full">
      <SectionHead title="الحصص القادمة" />
      {groups.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-[#94A3B8]">لا حصص قادمة.</p>
      ) : (
        <div className="space-y-4">
          {groups.map(g => (
            <div key={g.key}>
              <div className="mb-2 flex items-center gap-2 text-[12px] font-extrabold text-blue-700">
                <CalendarDays size={14} /> {g.label}
              </div>
              <ul className="space-y-2">
                {g.items.map(s => {
                  const live = joinable(s)
                  return (
                    <li key={s.id} className={`flex items-center gap-3 rounded-2xl p-3 ring-1 transition
                                               ${live ? 'bg-blue-600 text-white ring-blue-600 shadow-md shadow-blue-700/30' : 'bg-[#F8FAFC] ring-[#E2E8F0]'}`}>
                      <div className="w-14 shrink-0 text-center">
                        <div className={`text-[15px] font-extrabold tabular-nums ${live ? 'text-white' : 'text-[#1E3A8A]'}`}>{fmtHour(s.startsAt)}</div>
                        <div className={`text-[10.5px] font-semibold ${live ? 'text-blue-100' : 'text-[#94A3B8]'}`}>{s.durationMin} د</div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`text-[13.5px] font-bold truncate ${live ? 'text-white' : 'text-[#1E3A8A]'}`}>{s.title}</div>
                        <div className={`mt-0.5 flex flex-wrap items-center gap-x-2 text-[11.5px] ${live ? 'text-blue-100' : 'text-[#64748B]'}`}>
                          <span>{s.teacher}</span><span>·</span><span>{MODE[s.mode].label}</span>
                          {s.location && <span className="inline-flex items-center gap-0.5"><MapPin size={11} /> {s.location}</span>}
                        </div>
                      </div>
                      {s.reminder
                        ? <Bell size={15} className={live ? 'text-amber-300' : 'text-amber-500'} aria-label="تذكير مفعّل" />
                        : <BellOff size={15} className={live ? 'text-blue-200' : 'text-[#CBD5E1]'} aria-label="بدون تذكير" />}
                      {live
                        ? <a href={s.meetingUrl!} target="_blank" rel="noopener noreferrer"
                             className="rounded-lg bg-gradient-to-l from-amber-400 to-yellow-500 px-3 py-1.5 text-[12px] font-extrabold text-blue-900">ادخل الآن</a>
                        : s.meetingUrl && <a href={s.meetingUrl} target="_blank" rel="noopener noreferrer"
                             className="rounded-lg bg-white ring-1 ring-[#E2E8F0] px-3 py-1.5 text-[12px] font-bold text-blue-700 hover:ring-blue-300">الرابط</a>}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </Surface>
  )
}

/* ── Weekly timetable ──────────────────────────────────── */

export function Timetable({ p }: { p: StudentProfile }) {
  const [compact, setCompact] = useState(false)
  // This week, Monday first.
  const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
  const end = new Date(start.getTime() + 7 * 864e5)
  const week = p.sessions.filter(s => s.status !== 'cancelled' && new Date(s.startsAt) >= start && new Date(s.startsAt) < end)
  const next = upcomingSessions(p)[0]
  const todayN = new Date().getDay()
  const hoursUsed = [...new Set(week.map(s => new Date(s.startsAt).getHours()))].sort((a, b) => a - b)

  return (
    <Surface id="timetable" className="p-5 sm:p-6 scroll-mt-24">
      <SectionHead title="الجدول الأسبوعي" action={
        <div className="inline-flex gap-1 bg-[#EEF2F7] rounded-xl p-1">
          {[[false, 'شبكة'], [true, 'مختصر']].map(([v, l]) => (
            <button key={String(v)} onClick={() => setCompact(v as boolean)}
                    className={`px-3 py-1 rounded-lg text-[12px] font-bold transition ${compact === v ? 'bg-white text-blue-700 shadow-sm' : 'text-[#64748B]'}`}>
              {l as string}
            </button>
          ))}
        </div>} />
      {week.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-[#94A3B8]">لا حصص هذا الأسبوع.</p>
      ) : compact ? (
        <ul className="divide-y divide-[#EEF2F7]">
          {WEEK.map(d => {
            const items = week.filter(s => new Date(s.startsAt).getDay() === d.n)
            return (
              <li key={d.n} className={`flex items-center gap-3 py-2.5 ${d.n === todayN ? 'text-blue-700' : ''}`}>
                <span className={`w-20 text-[12.5px] font-bold ${d.n === todayN ? 'text-blue-700' : 'text-[#475569]'}`}>{d.label}</span>
                <span className="flex-1 text-[12.5px] text-[#334155]">
                  {items.length ? items.map(s => `${fmtHour(s.startsAt)} ${s.title}`).join(' · ') : <span className="text-[#CBD5E1]">—</span>}
                </span>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
          <div className="grid min-w-[760px]" style={{ gridTemplateColumns: `64px repeat(7, minmax(0,1fr))` }}>
            <div />
            {WEEK.map(d => (
              <div key={d.n} className={`px-1 pb-2 text-center text-[12px] font-extrabold ${d.n === todayN ? 'text-blue-700' : 'text-[#475569]'}`}>
                <span className={d.n === todayN ? 'rounded-lg bg-blue-50 px-2 py-1' : ''}>{d.label}</span>
              </div>
            ))}
            {hoursUsed.map(h => (
              <div key={h} className="contents">
                <div className="border-t border-[#EEF2F7] pt-2 text-[11.5px] font-bold text-[#94A3B8] tabular-nums">{String(h).padStart(2, '0')}:00</div>
                {WEEK.map(d => {
                  const items = week.filter(s => new Date(s.startsAt).getDay() === d.n && new Date(s.startsAt).getHours() === h)
                  return (
                    <div key={d.n} className={`border-t border-[#EEF2F7] p-1 min-h-[64px] ${d.n === todayN ? 'bg-blue-50/40' : ''}`}>
                      {items.map(s => {
                        const isNext = next?.id === s.id
                        return (
                          <div key={s.id} className={`rounded-xl p-2 text-[11.5px] leading-tight ring-1
                                                     ${isNext ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white ring-blue-600 shadow-md'
                                                       : s.mode === 'private' ? 'bg-amber-50 text-amber-900 ring-amber-200'
                                                       : 'bg-white text-[#1E3A8A] ring-[#E2E8F0]'}`}>
                            <div className="font-extrabold truncate">{s.title}</div>
                            <div className={isNext ? 'text-blue-100' : 'text-[#64748B]'}>{fmtHour(s.startsAt)} · {s.durationMin} د</div>
                            <div className={`truncate ${isNext ? 'text-blue-100' : 'text-[#94A3B8]'}`}>{s.teacher}</div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </Surface>
  )
}

/* ── Attendance ────────────────────────────────────────── */

export function AttendancePanel({ p }: { p: StudentProfile }) {
  const a = attendanceStats(p)
  const missed = p.attendance.filter(m => m.status === 'absent' || m.status === 'excused')
    .sort((x, y) => +new Date(y.at) - +new Date(x.at)).slice(0, 4)
  return (
    <Surface className="p-5 sm:p-6 h-full">
      <SectionHead title="الحضور والانضباط" />
      {a.rate == null ? (
        <p className="py-8 text-center text-[13px] text-[#94A3B8]">لم يُسجَّل حضور بعد.</p>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <Ring pct={a.rate} size={128} color="#16A34A" label="نسبة الحضور" />
            <div className="grid grid-cols-2 gap-2.5 flex-1 w-full">
              {[
                { l: 'حضر', v: a.present, c: 'text-emerald-700' },
                { l: 'متأخر', v: a.late, c: 'text-blue-700' },
                { l: 'غائب', v: a.absent, c: 'text-rose-700' },
                { l: 'سلسلة الحضور', v: a.streak, c: 'text-amber-700', icon: true },
              ].map(x => (
                <div key={x.l} className="rounded-xl bg-[#F8FAFC] ring-1 ring-[#E2E8F0] px-3 py-2.5">
                  <div className="text-[11px] font-bold text-[#64748B] flex items-center gap-1">{x.icon && <Flame size={12} className="text-amber-500" />}{x.l}</div>
                  <div className={`text-[20px] font-extrabold tabular-nums ${x.c}`}>{x.v}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-5">
            <div className="mb-2 text-[12px] font-bold text-[#64748B]">الحضور الأسبوعي · آخر 8 أسابيع</div>
            <BarChart data={a.weekly} height={110} color="#16A34A" unit="%" />
          </div>
          {missed.length > 0 && (
            <div className="mt-4">
              <div className="mb-2 text-[12px] font-bold text-[#64748B]">الحصص الفائتة</div>
              <ul className="space-y-1.5">
                {missed.map((m, i) => (
                  <li key={i} className="flex items-center gap-2 text-[12.5px]">
                    <Clock size={13} className="text-rose-500 shrink-0" />
                    <span className="text-[#475569] tabular-nums shrink-0">{fmtShort(m.at)}</span>
                    <span className="font-semibold text-[#1E3A8A] truncate">{m.title}</span>
                    <span className="mr-auto text-[11.5px] text-[#94A3B8] truncate">{m.note ?? (m.status === 'excused' ? 'بعذر' : 'بدون سبب مسجّل')}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </Surface>
  )
}

