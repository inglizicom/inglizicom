'use client'

import {
  Activity, Award, BookOpen, CalendarDays, CalendarX, CheckCircle2, Clock, Coins, FileText, Flame, GraduationCap,
  Layers, ListChecks, PenLine, PlayCircle, Route, Star, Target, TrendingUp, UserRound, Users, Video,
} from 'lucide-react'
import {
  classifyTracks, exercisesDone, hoursFrom, learningStatus, sessionsSplit,
  type DashSession, type StudentDashboard,
} from '@/lib/student-dashboard'
import {
  Bar, Empty, Face, IdentityHeader, Kpi, Panel, PanelHead, Pill, Ring, TrackBadges, fmtDay, fmtHour,
} from './ui'

/**
 * دوراتي — the learning dashboard.
 *
 * What am I learning, where am I in it, what is next. The course track
 * (self-paced lessons) and the class track (live group / private classes) sit
 * side by side in "مساراتي": each in its own block, joined in one place.
 */

export type GoTab = 'path' | 'tasks' | 'rewards' | 'files' | 'progress' | 'profile'

export interface ResumeLesson { lesson: string; unit: string | null; course: string | null; type: string; courseProgress: number }

const LADDER = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const WEEK = [
  { n: 1, label: 'الإثنين' }, { n: 2, label: 'الثلاثاء' }, { n: 3, label: 'الأربعاء' }, { n: 4, label: 'الخميس' },
  { n: 5, label: 'الجمعة' }, { n: 6, label: 'السبت' }, { n: 0, label: 'الأحد' },
]
const SEAT = { active: { t: 'نشط', tone: 'ok' }, waitlisted: { t: 'قائمة انتظار', tone: 'warn' }, completed: { t: 'أنهيته', tone: 'muted' }, cancelled: { t: 'ملغى', tone: 'bad' } } as const

function joinable(s: DashSession) {
  const start = new Date(s.starts_at).getTime(), now = Date.now()
  return !!s.meeting_url && now >= start - 15 * 60000 && now <= start + s.duration_min * 60000
}

function dayLabel(iso: string) {
  const d = new Date(iso), today = new Date(), tomorrow = new Date(Date.now() + 864e5)
  if (d.toDateString() === today.toDateString()) return 'اليوم'
  if (d.toDateString() === tomorrow.toDateString()) return 'غدًا'
  return d.toLocaleDateString('ar-MA', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function MyCourses({ dash, name, avatarUrl, level, overallPct, resume, onResume, goTab }: {
  dash: StudentDashboard; name: string; avatarUrl: string | null
  level: { current: string | null; next: string | null; stage: string | null }
  overallPct: number; resume: ResumeLesson | null; onResume: () => void; goTab: (t: GoTab) => void
}) {
  const tracks = classifyTracks(dash)
  const { upcoming, missed } = sessionsSplit(dash)
  const study = dash.study
  const status = learningStatus(dash)
  const courses = dash.courses ?? []
  const classes = dash.classes ?? []
  const currentLevel = level.current ?? tracks.activeCourses[0]?.level ?? tracks.activeSeats[0]?.level ?? null
  const coursePct = resume?.courseProgress ?? (tracks.activeCourses[0]
    ? Math.round((tracks.activeCourses[0].lessons_done / Math.max(1, tracks.activeCourses[0].lessons_total)) * 100) : overallPct)

  // upcoming, grouped by day
  const groups = upcoming.slice(0, 8).reduce<{ key: string; label: string; items: DashSession[] }[]>((acc, s) => {
    const key = new Date(s.starts_at).toDateString()
    const g = acc.find(x => x.key === key)
    if (g) g.items.push(s); else acc.push({ key, label: dayLabel(s.starts_at), items: [s] })
    return acc
  }, [])

  // this week's timetable
  const ws = new Date(); ws.setHours(0, 0, 0, 0); ws.setDate(ws.getDate() - ((ws.getDay() + 6) % 7))
  const we = new Date(ws.getTime() + 7 * 864e5)
  const week = (dash.sessions ?? []).filter(s => s.status !== 'cancelled' && new Date(s.starts_at) >= ws && new Date(s.starts_at) < we)
  const todayN = new Date().getDay()
  const nextId = upcoming[0]?.id

  const weekly = study?.weekly ?? []
  const weeklyMax = Math.max(1, ...weekly.map(w => w.events))

  return (
    <div className="space-y-5">
      {/* 1 — identity + quick actions */}
      <IdentityHeader name={name} avatarUrl={avatarUrl} trackLabel={tracks.label} kinds={tracks.kinds}
        level={currentLevel} enrolledAt={dash.student?.enrollment_date ?? null} statusLabel={status.label}
        actions={[
          ...(resume ? [{ label: 'متابعة الدرس', icon: PlayCircle, onClick: onResume, primary: true }] : []),
          { label: 'مساري', icon: Route, onClick: () => goTab('path') },
          { label: 'تماريني', icon: ListChecks, onClick: () => goTab('tasks') },
          { label: 'ملفي', icon: UserRound, onClick: () => goTab('profile') },
        ]} />

      {/* 2 — KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi icon={BookOpen} tone="brown" label="الدورات النشطة" value={tracks.activeCourses.length} sub={`${courses.length} إجمالاً`} />
        <Kpi icon={TrendingUp} tone="gold" label="تقدّم الدورة" value={`${coursePct}%`} sub={resume?.course ?? tracks.activeCourses[0]?.title ?? '—'} />
        <Kpi icon={CheckCircle2} tone="green" label="تمارين منجزة" value={exercisesDone(dash)} sub={study ? `${study.quizzes_passed} اختبار · ${study.tasks_done} مهمة` : undefined} />
        <Kpi icon={PlayCircle} tone="blue" label="ساعات المشاهدة" value={study?.watch_minutes ? hoursFrom(study.watch_minutes) : null}
             sub={study?.watch_minutes ? `${study.videos_completed} فيديو مكتمل` : `${study?.videos_completed ?? 0} فيديو مكتمل · يُحتسب الآن`} />
        <Kpi icon={Video} tone="stone" label="حصص قادمة" value={tracks.activeSeats.length ? upcoming.length : null} sub={tracks.activeSeats.length ? `${tracks.activeSeats.length} قسم نشط` : 'لا أقسام مباشرة'} />
        <Kpi icon={CalendarX} tone="rose" label="حصص فائتة" value={dash.attendance?.marks ? dash.attendance.absent : null} sub={dash.attendance?.rate != null ? `حضور ${dash.attendance.rate}%` : undefined} />
        <Kpi icon={GraduationCap} tone="gold" label="المستوى الحالي" value={currentLevel ? <span dir="ltr">{currentLevel}</span> : null} sub={level.next ? `التالي: ${level.next}` : undefined} />
        <Kpi icon={Flame} tone="rose" label="أيام متتالية" value={study?.streak?.current ?? 0} sub={study?.streak ? `أطول سلسلة ${study.streak.longest}` : undefined} />
      </div>

      {/* 3 — current lesson / active learning */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <section className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-[var(--ic-dark,#3A2A1D)] to-[var(--ic-dark-3,#2A1D12)] p-5 text-white lg:col-span-3">
          <div aria-hidden className="pointer-events-none absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(201,162,74,.28),transparent_65%)]" />
          <div className="relative flex items-center gap-4">
            <Ring pct={coursePct} size={92} label="الدورة" dark />
            <div className="min-w-0 flex-1">
              <div className="text-[11.5px] font-bold text-[var(--ic-gold,#E9C77F)]">{resume ? 'الدرس الحالي' : 'تعلّمي الآن'}</div>
              <div className="mt-0.5 text-[17px] font-black leading-snug">{resume?.lesson ?? (tracks.activeCourses[0]?.title ?? 'لا درس معلّق — أحسنت!')}</div>
              <div className="mt-1 truncate text-[12px] text-amber-100/75">{[resume?.course, resume?.unit].filter(Boolean).join(' · ') || (tracks.activeSeats[0]?.title ?? '')}</div>
            </div>
          </div>
          <div className="relative mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-white/10 px-2.5 py-2 text-center"><div className="text-[16px] font-black tabular-nums">{study?.active_days_7 ?? 0}</div><div className="text-[10.5px] text-amber-100/70">أيام نشاط هذا الأسبوع</div></div>
            <div className="rounded-xl bg-white/10 px-2.5 py-2 text-center"><div className="text-[16px] font-black tabular-nums">{study ? hoursFrom(study.watch_minutes_7) : 0}</div><div className="text-[10.5px] text-amber-100/70">ساعات هذا الأسبوع</div></div>
            <div className="rounded-xl bg-white/10 px-2.5 py-2 text-center"><div className="text-[16px] font-black tabular-nums">{study?.lessons_completed ?? 0}</div><div className="text-[10.5px] text-amber-100/70">درس مكتمل</div></div>
          </div>
          {resume && (
            <button type="button" onClick={onResume}
                    className="relative mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--ic-gold,#C9A24A)] py-3 text-[14px] font-black text-black hover:brightness-105">
              <PlayCircle size={17} /> تابِع الدرس الآن
            </button>
          )}
        </section>

        <Panel className="p-5 lg:col-span-2">
          <PanelHead icon={Activity} title="حالتي الدراسية" sub={status.hint} />
          <div className={`rounded-2xl px-4 py-3 text-[14px] font-black ring-1 ${status.tone === 'good' ? 'bg-emerald-50 text-emerald-800 ring-emerald-200' : status.tone === 'mid' ? 'bg-amber-50 text-amber-900 ring-amber-200' : 'bg-rose-50 text-rose-800 ring-rose-200'}`}>
            {status.tone === 'good' ? '🌟 ' : status.tone === 'mid' ? '💪 ' : '⏰ '}{status.label}
          </div>
          {weekly.length > 0 && (
            <>
              <div className="mt-4 mb-1.5 text-[11.5px] font-bold text-[#A89B8C]">نشاطك في آخر 8 أسابيع</div>
              {/* bars are direct children of a fixed-height row, so their % heights resolve */}
              <div className="flex h-20 items-end gap-1.5" dir="ltr">
                {weekly.map((w, i) => (
                  <div key={w.week} title={`${w.events}`}
                       className={`flex-1 rounded-md ${i === weekly.length - 1 ? 'bg-[var(--ic-gold,#C9A24A)]' : 'bg-[#E3D6C2]'}`}
                       style={{ height: `${Math.max(6, (w.events / weeklyMax) * 100)}%` }} />
                ))}
              </div>
              <div className="mt-1 flex justify-between text-[10px] font-semibold text-[#A89B8C]" dir="ltr"><span>قبل 8 أسابيع</span><span>هذا الأسبوع</span></div>
            </>
          )}
        </Panel>
      </div>

      {/* 4 — my tracks: course and class, separate but together */}
      <Panel className="p-5">
        <PanelHead icon={Layers} title="مساراتي" sub="الدورة الذاتية والحصص المباشرة — كل مسار في مكانه" action={<TrackBadges kinds={tracks.kinds} size="sm" />} />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* course track */}
          <div className="rounded-2xl bg-[#FBF8F3] p-4 ring-1 ring-[#ECE4D8]">
            <div className="mb-3 flex items-center gap-2 text-[13px] font-black text-[#5A3E28]">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> الدورات الذاتية
              <span className="mr-auto text-[11px] font-bold text-[#A89B8C]">{courses.length} دورة</span>
            </div>
            {courses.length === 0 ? <Empty icon={BookOpen} text="لا دورات ذاتية" hint="تواصل مع الإدارة لفتح دورة على المنصة." /> : (
              <ul className="space-y-2.5">
                {courses.map(c => {
                  const pct = Math.round((c.lessons_done / Math.max(1, c.lessons_total)) * 100)
                  return (
                    <li key={c.course_id} className="rounded-xl bg-white p-3 ring-1 ring-[#ECE4D8]">
                      <div className="flex items-center gap-2">
                        <span className="min-w-0 flex-1 truncate text-[13.5px] font-extrabold text-[#1F1A16]">{c.title}</span>
                        {c.level && <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10.5px] font-black text-amber-800" dir="ltr">{c.level}</span>}
                        <Pill tone={c.status === 'active' ? 'ok' : 'muted'}>{c.status === 'active' ? 'نشطة' : 'مكتملة'}</Pill>
                      </div>
                      <div className="mt-2 flex items-center gap-2.5"><Bar pct={pct} /><span className="text-[11.5px] font-black tabular-nums text-[#5A3E28]">{pct}%</span></div>
                      <div className="mt-1 text-[11px] text-[#A89B8C]">{c.lessons_done} من {c.lessons_total} درس · منذ {fmtDay(c.enrolled_at)}</div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
          {/* class track */}
          <div className="rounded-2xl bg-[#F6F3EF] p-4 ring-1 ring-[#E4DDD3]">
            <div className="mb-3 flex items-center gap-2 text-[13px] font-black text-[#3A2A1D]">
              <span className="h-2 w-2 rounded-full bg-stone-600" /> الأقسام والحصص المباشرة
              <span className="mr-auto text-[11px] font-bold text-[#A89B8C]">{classes.length} قسم</span>
            </div>
            {classes.length === 0 ? <Empty icon={Users} text="لست مسجّلاً في قسم مباشر" hint="الحصص المباشرة (جماعية أو فردية) تظهر هنا فور تسجيلك." /> : (
              <ul className="space-y-2.5">
                {classes.map(c => (
                  <li key={c.enrollment_id} className="rounded-xl bg-white p-3 ring-1 ring-[#E4DDD3]">
                    <div className="flex items-start gap-2.5">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${c.mode === 'private' ? 'bg-orange-50 text-orange-700' : 'bg-stone-100 text-stone-700'}`}>
                        {c.mode === 'private' ? <UserRound size={17} /> : <Users size={17} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="truncate text-[13.5px] font-extrabold text-[#1F1A16]">{c.title}</span>
                          <Pill tone={c.mode === 'private' ? 'gold' : 'muted'}>{c.mode === 'private' ? 'فردي' : 'جماعي'}</Pill>
                          <Pill tone={SEAT[c.status].tone}>{SEAT[c.status].t}</Pill>
                        </div>
                        <div className="mt-0.5 truncate text-[11.5px] text-[#7A6E62]">
                          {[c.teacher?.name, c.schedule_note, c.course_title && `ضمن ${c.course_title}`].filter(Boolean).join(' · ')}
                        </div>
                        <div className="mt-1 text-[11px] text-[#A89B8C]">حضرت {c.attended} من {c.sessions_done} حصة
                          {c.next_session_at && <> · القادمة {fmtDay(c.next_session_at)} {fmtHour(c.next_session_at)}</>}</div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Panel>

      {/* 5 — upcoming + missed */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <Panel className="p-5 lg:col-span-3">
          <PanelHead icon={CalendarDays} title="الحصص القادمة" sub={upcoming.length ? `${upcoming.length} حصة مبرمجة` : undefined} />
          {groups.length === 0 ? <Empty icon={CalendarDays} text="لا حصص مباشرة قادمة" hint={tracks.course ? 'تابع دروس دورتك الذاتية في «مساري».' : undefined} /> : (
            <div className="space-y-3.5">
              {groups.map(g => (
                <div key={g.key}>
                  <div className="mb-1.5 text-[12px] font-black text-[var(--ic-dark,#3A2A1D)]">{g.label}</div>
                  <ul className="space-y-2">
                    {g.items.map(s => {
                      const live = joinable(s)
                      return (
                        <li key={s.id} className={`flex items-center gap-3 rounded-2xl p-3 ring-1 ${live ? 'bg-[var(--ic-dark,#3A2A1D)] text-white ring-transparent' : 'bg-[#FBF8F3] ring-[#ECE4D8]'}`}>
                          <div className="w-14 shrink-0 text-center">
                            <div className={`text-[15px] font-black tabular-nums ${live ? 'text-white' : 'text-[#1F1A16]'}`}>{fmtHour(s.starts_at)}</div>
                            <div className={`text-[10.5px] ${live ? 'text-amber-100/70' : 'text-[#A89B8C]'}`}>{s.duration_min} د</div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[13.5px] font-bold">{s.title}</div>
                            <div className={`truncate text-[11.5px] ${live ? 'text-amber-100/75' : 'text-[#7A6E62]'}`}>
                              {[s.teacher_name, s.mode === 'private' ? 'فردي' : 'جماعي', s.location].filter(Boolean).join(' · ')}
                            </div>
                          </div>
                          {live
                            ? <a href={s.meeting_url!} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-[var(--ic-gold,#C9A24A)] px-3 py-2 text-[12px] font-black text-black">ادخل الآن</a>
                            : s.meeting_url && <a href={s.meeting_url} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-white px-3 py-2 text-[12px] font-bold text-[#5A3E28] ring-1 ring-[#E2D8C8]">الرابط</a>}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel className="p-5 lg:col-span-2">
          <PanelHead icon={CalendarX} title="الحصص الفائتة" sub={dash.attendance?.rate != null ? `نسبة الحضور ${dash.attendance.rate}%` : undefined} />
          {missed.length === 0 && !(dash.attendance?.absent) ? <Empty icon={CheckCircle2} text="لم تفتك أي حصة 👏" /> : (
            <ul className="space-y-2">
              {(missed.length ? missed.map(m => ({ at: m.starts_at, title: m.title, note: null as string | null }))
                              : (dash.attendance?.recent ?? []).filter(r => r.status === 'absent')).slice(0, 5).map((m, i) => (
                <li key={i} className="flex items-center gap-2.5 rounded-xl bg-rose-50/60 px-3 py-2.5 ring-1 ring-rose-100">
                  <CalendarX size={15} className="shrink-0 text-rose-600" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-bold text-[#1F1A16]">{m.title}</div>
                    <div className="truncate text-[11px] text-[#7A6E62]">{fmtDay(m.at)}{m.note ? ` · ${m.note}` : ''}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-[11.5px] leading-relaxed text-[#A89B8C]">إن فاتتك حصة، راجع تقرير الأستاذ وتمارين الدرس في «تماريني».</p>
        </Panel>
      </div>

      {/* 6 — weekly timetable */}
      <Panel className="p-5" id="timetable">
        <PanelHead icon={Clock} title="جدولي هذا الأسبوع" sub={week.length ? `${week.length} حصة` : 'لا حصص مباشرة هذا الأسبوع'} />
        {week.length === 0 ? <Empty icon={Clock} text="جدولك فارغ هذا الأسبوع" hint={tracks.course ? 'وقتك لك — أكمل درسًا من دورتك الذاتية.' : undefined} /> : (
          <>
            <div className="hidden grid-cols-7 gap-2 md:grid">
              {WEEK.map(d => {
                const items = week.filter(s => new Date(s.starts_at).getDay() === d.n).sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at))
                return (
                  <div key={d.n} className={`min-h-[120px] rounded-2xl p-2 ring-1 ${d.n === todayN ? 'bg-[var(--ic-gold-soft,#F6EBD3)] ring-[#E7D6B5]' : 'bg-[#FBF8F3] ring-[#ECE4D8]'}`}>
                    <div className={`mb-1.5 text-center text-[11.5px] font-black ${d.n === todayN ? 'text-[#5A3E28]' : 'text-[#7A6E62]'}`}>{d.label}</div>
                    <div className="space-y-1.5">
                      {items.map(s => (
                        <div key={s.id} className={`rounded-xl p-2 text-[11px] leading-tight ${s.id === nextId ? 'bg-[var(--ic-dark,#3A2A1D)] text-white' : s.status === 'done' ? 'bg-white text-[#A89B8C] ring-1 ring-[#ECE4D8]' : 'bg-white text-[#1F1A16] ring-1 ring-[#E2D8C8]'}`}>
                          <div className="font-black tabular-nums">{fmtHour(s.starts_at)}</div>
                          <div className="truncate font-semibold">{s.title}</div>
                          <div className={`truncate ${s.id === nextId ? 'text-amber-100/70' : 'text-[#A89B8C]'}`}>{s.teacher_name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
            <ul className="divide-y divide-[#EFE8DD] md:hidden">
              {WEEK.map(d => {
                const items = week.filter(s => new Date(s.starts_at).getDay() === d.n)
                return (
                  <li key={d.n} className="flex items-start gap-3 py-2.5">
                    <span className={`w-16 shrink-0 text-[12.5px] font-black ${d.n === todayN ? 'text-[#5A3E28]' : 'text-[#7A6E62]'}`}>{d.label}</span>
                    <span className="flex-1 space-y-1 text-[12.5px]">
                      {items.length ? items.map(s => (
                        <span key={s.id} className={`block ${s.id === nextId ? 'font-black text-[#1F1A16]' : s.status === 'done' ? 'text-[#A89B8C]' : 'text-[#3A2A1D]'}`}>
                          <bdi className="tabular-nums">{fmtHour(s.starts_at)}</bdi> · {s.title}
                        </span>
                      )) : <span className="text-[#D9CFC2]">—</span>}
                    </span>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </Panel>

      {/* 7 + 8 — exercises and hours */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel className="p-5">
          <PanelHead icon={PenLine} title="التمارين والتدريب" sub={study?.quiz_avg != null ? `متوسط نتائجك ${study.quiz_avg}%` : undefined} />
          {!study ? <Empty icon={PenLine} text="لا بيانات بعد" /> : (
            <>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { l: 'اختبارات ناجحة', v: study.quizzes_passed, i: CheckCircle2 },
                  { l: 'امتحانات وحدات', v: study.exams_passed, i: Award },
                  { l: 'مهام منجزة', v: `${study.tasks_done}/${study.tasks_total}`, i: ListChecks },
                ].map(x => (
                  <div key={x.l} className="rounded-xl bg-[#FBF8F3] p-3 text-center ring-1 ring-[#ECE4D8]">
                    <x.i size={15} className="mx-auto text-[#B8862E]" />
                    <div className="mt-1 text-[18px] font-black tabular-nums text-[#1F1A16]">{x.v}</div>
                    <div className="text-[10.5px] font-semibold text-[#7A6E62]">{x.l}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-3">
                <div>
                  <div className="mb-1 flex justify-between text-[12px] font-bold text-[#5A3E28]"><span>دقة التدريب</span>
                    <span className="tabular-nums">{study.practice_total ? Math.round((study.practice_correct / study.practice_total) * 100) : 0}%</span></div>
                  <Bar pct={study.practice_total ? (study.practice_correct / study.practice_total) * 100 : 0} cls="bg-emerald-500" />
                  <div className="mt-1 text-[11px] text-[#A89B8C]">{study.practice_correct.toLocaleString('en-US')} إجابة صحيحة من {study.practice_total.toLocaleString('en-US')}</div>
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-[12px] font-bold text-[#5A3E28]"><span>المهام المنجزة</span>
                    <span className="tabular-nums">{study.tasks_total ? Math.round((study.tasks_done / study.tasks_total) * 100) : 0}%</span></div>
                  <Bar pct={study.tasks_total ? (study.tasks_done / study.tasks_total) * 100 : 0} />
                </div>
              </div>
              <button type="button" onClick={() => goTab('tasks')} className="mt-4 w-full rounded-xl bg-[#FBF8F3] py-2.5 text-[12.5px] font-black text-[#5A3E28] ring-1 ring-[#E2D8C8] hover:bg-[var(--ic-gold-soft,#F6EBD3)]">افتح تماريني</button>
            </>
          )}
        </Panel>

        <Panel className="p-5">
          <PanelHead icon={PlayCircle} title="ساعات المشاهدة" sub="وقت المشاهدة الفعلي داخل دروس الفيديو" />
          <div className="flex items-center gap-5">
            <div className="text-center">
              <div className="text-[40px] font-black leading-none tabular-nums text-[#1F1A16]">{study ? hoursFrom(study.watch_minutes) : 0}</div>
              <div className="mt-1 text-[12px] font-bold text-[#7A6E62]">ساعة إجمالاً</div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between rounded-xl bg-[#FBF8F3] px-3 py-2 ring-1 ring-[#ECE4D8] text-[12.5px]"><span className="font-bold text-[#5A3E28]">هذا الأسبوع</span><b className="tabular-nums">{study ? hoursFrom(study.watch_minutes_7) : 0} س</b></div>
              <div className="flex items-center justify-between rounded-xl bg-[#FBF8F3] px-3 py-2 ring-1 ring-[#ECE4D8] text-[12.5px]"><span className="font-bold text-[#5A3E28]">فيديوهات مكتملة</span><b className="tabular-nums">{study?.videos_completed ?? 0}</b></div>
              <div className="flex items-center justify-between rounded-xl bg-[#FBF8F3] px-3 py-2 ring-1 ring-[#ECE4D8] text-[12.5px]"><span className="font-bold text-[#5A3E28]">دروس مكتملة</span><b className="tabular-nums">{study?.lessons_completed ?? 0}</b></div>
            </div>
          </div>
          {!!study && study.watch_minutes === 0 && (
            <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-[11.5px] font-semibold text-amber-900 ring-1 ring-amber-200">بدأنا احتساب وقت المشاهدة الآن — سيظهر هنا بعد أول فيديو تشاهده.</p>
          )}
        </Panel>
      </div>

      {/* 9 — level + teachers */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel className="p-5">
          <PanelHead icon={Target} title="المستوى والتقدّم" sub={level.stage ?? undefined} />
          <div className="grid grid-cols-7 gap-1" dir="ltr">
            {LADDER.map(x => {
              const on = x === currentLevel, nextL = x === level.next
              const past = currentLevel ? LADDER.indexOf(x) < LADDER.indexOf(currentLevel) : false
              return (
                <div key={x} className={`relative rounded-xl py-2.5 text-center text-[13px] font-black
                                        ${on ? 'bg-[var(--ic-dark,#3A2A1D)] text-[var(--ic-gold,#E9C77F)] shadow-md' : past ? 'bg-[#EFE4D6] text-[#5A3E28]' : nextL ? 'bg-amber-50 text-amber-800 ring-1 ring-amber-300' : 'bg-[#F5F1EB] text-[#D3C7B6]'}`}>
                  {x}
                  {nextL && <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded bg-amber-400 px-1 text-[8.5px] font-black text-black">التالي</span>}
                </div>
              )
            })}
          </div>
          <div className="mt-5 flex items-center gap-4">
            <Ring pct={overallPct} size={84} label="الإنجاز" />
            <p className="flex-1 text-[12.5px] leading-relaxed text-[#5A3E28]">
              {currentLevel ? <>أنت في المستوى <b dir="ltr">{currentLevel}</b>{level.next ? <> وهدفك القادم <b dir="ltr">{level.next}</b></> : null}. </> : null}
              أكملت <b>{overallPct}%</b> من مسارك — كل درس وتمرين يقرّبك من الشهادة.
            </p>
          </div>
        </Panel>

        <Panel className="p-5">
          <PanelHead icon={Star} title="أساتذتي" sub={(dash.teachers ?? []).length ? `${(dash.teachers ?? []).length} أستاذ` : undefined} />
          {(dash.teachers ?? []).length === 0 ? <Empty icon={UserRound} text="لم يُسنَد إليك أستاذ بعد" /> : (
            <ul className="space-y-2.5">
              {(dash.teachers ?? []).map(t => (
                <li key={t.id} className="flex items-center gap-3 rounded-2xl bg-[#FBF8F3] p-3 ring-1 ring-[#ECE4D8]">
                  <Face name={t.name ?? 'أستاذ'} url={t.avatar_url} size={44} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-extrabold text-[#1F1A16]">{t.name ?? 'أستاذ'}</div>
                    <div className="truncate text-[11.5px] font-bold text-[#B8862E]">
                      {[t.assigned && 'الأستاذ المسؤول', ...t.classes.map(c => `أستاذ ${c}`)].filter(Boolean).join(' · ')}
                    </div>
                    {t.headline && <div className="truncate text-[11.5px] text-[#7A6E62]">{t.headline}</div>}
                  </div>
                  {t.rating_count ? <span className="inline-flex items-center gap-0.5 text-[12px] font-bold text-[#5A3E28]"><Star size={12} className="text-amber-400" fill="currentColor" />{Number(t.rating_avg).toFixed(1)}</span> : null}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* tools — the existing learning screens */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
        {[
          { t: 'path' as const, l: 'مساري', i: Route }, { t: 'tasks' as const, l: 'تماريني', i: ListChecks },
          { t: 'rewards' as const, l: 'المكافآت', i: Coins }, { t: 'files' as const, l: 'الملفات', i: FileText },
          { t: 'progress' as const, l: 'الامتحانات', i: Award },
        ].map(x => (
          <button key={x.t} type="button" onClick={() => goTab(x.t)}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-white py-3 text-[13px] font-black text-[#3A2A1D] ring-1 ring-[#ECE4D8] hover:bg-[var(--ic-gold-soft,#F6EBD3)]">
            <x.i size={16} className="text-[#B8862E]" /> {x.l}
          </button>
        ))}
      </div>
    </div>
  )
}
