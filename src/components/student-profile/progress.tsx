'use client'

import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Award, BookOpen, CalendarCheck, Check, ClipboardCopy, CreditCard, Download, Eye, FileText, Flame, GraduationCap,
  Medal, MessageCircle, PenLine, PlayCircle, Receipt, Star, StickyNote, Target, Trophy, Users, Wallet, Brain, Timer,
} from 'lucide-react'
import { BarChart } from '@/app/teacher/_charts'
import { Face, SectionHead, StatusPill, Surface, TONE, type Tone, type PillTone } from '@/app/teacher/_kit'
import { attendanceStats, upcomingSessions, type StudentProfile } from '@/lib/student-profile'
import { Bar, Unavailable, fmtDay, fmtHour, fmtShort, mad } from './overview'

const LADDER = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const SKILL_BAR: Record<string, string> = {
  speaking: 'bg-blue-600', listening: 'bg-emerald-500', reading: 'bg-indigo-500',
  writing: 'bg-amber-400', vocabulary: 'bg-sky-500', grammar: 'bg-rose-500',
}

/* ── Exercises and study activity ──────────────────────── */

export function StudyActivity({ p }: { p: StudentProfile }) {
  const s = p.study
  return (
    <Surface className="p-5 sm:p-6 h-full">
      <SectionHead title="التمارين ونشاط الدراسة" />
      {!s ? <Unavailable text="نشاط المنصة (التمارين، الفيديوهات، المفردات) يظهر هنا عند ربطه بفضاء الأستاذ." /> : (
        <>
          <div className="grid grid-cols-3 gap-2.5">
            {([
              [PenLine, 'تمارين', s.exercises, 'violet'], [Check, 'اختبارات ناجحة', s.quizzesPassed, 'emerald'],
              [Brain, 'مفردات', s.vocabulary, 'sky'], [PlayCircle, 'فيديوهات', s.videosWatched, 'stone'],
              [Timer, 'دقائق تدريب', s.practiceMinutes, 'gold'], [Target, 'متوسط النتيجة', s.avgScore != null ? `${s.avgScore}%` : '—', 'rose'],
            ] as [LucideIcon, string, number | string, Tone][]).map(([Icon, l, v, t]) => (
              <div key={l} className="rounded-xl bg-[#F8FAFC] ring-1 ring-[#E2E8F0] p-3">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${TONE[t]}`}><Icon size={14} /></span>
                <div className="mt-2 text-[18px] font-extrabold text-[#1E3A8A] tabular-nums leading-none">{typeof v === 'number' ? v.toLocaleString('en-US') : v}</div>
                <div className="mt-1 text-[11px] font-semibold text-[#64748B]">{l}</div>
              </div>
            ))}
          </div>
          {s.lastExerciseAt && <div className="mt-3 text-[11.5px] font-semibold text-[#94A3B8]">آخر تمرين: {fmtShort(s.lastExerciseAt)} · {fmtHour(s.lastExerciseAt)}</div>}
          <div className="mt-5">
            <div className="mb-2 text-[12px] font-bold text-[#64748B]">التمارين أسبوعياً</div>
            <BarChart data={s.weekly} height={110} color="#6366F1" unit=" تمرين" />
          </div>
          <div className="mt-5 space-y-2.5">
            <div className="text-[12px] font-bold text-[#64748B]">الإنجاز حسب المهارة</div>
            {s.skills.map(k => (
              <div key={k.key} className="flex items-center gap-3 text-[12.5px]">
                <span className="w-16 font-bold text-[#334155]">{k.label}</span>
                <Bar pct={k.pct} cls={SKILL_BAR[k.key]} />
                <span className="w-10 text-left font-extrabold text-[#1E3A8A] tabular-nums">{k.pct}%</span>
              </div>
            ))}
          </div>
        </>
      )}
    </Surface>
  )
}

/* ── Level & progress ──────────────────────────────────── */

export function LevelProgress({ p }: { p: StudentProfile }) {
  const l = p.levelInfo
  const current = l?.current ?? p.level
  return (
    <Surface className="p-5 sm:p-6 h-full">
      <SectionHead title="المستوى والتقدّم" />
      <div className="grid grid-cols-7 gap-1" dir="ltr">
        {LADDER.map(x => {
          const on = x === current
          const goal = x === (l?.goal ?? p.goalLevel)
          const past = current ? LADDER.indexOf(x) < LADDER.indexOf(current) : false
          return (
            <div key={x} className={`relative rounded-xl py-2.5 text-center text-[13px] font-extrabold transition
                                     ${on ? 'bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-md shadow-blue-700/30'
                                       : past ? 'bg-blue-50 text-blue-700' : goal ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-300' : 'bg-[#F1F5F9] text-[#CBD5E1]'}`}>
              {x}
              {goal && !on && <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded bg-amber-400 px-1 text-[8.5px] font-black text-blue-900">هدف</span>}
            </div>
          )
        })}
      </div>
      {!l ? (
        <div className="mt-4"><Unavailable text="تطوّر المستوى والتوصيات يظهران هنا عند ربط نتائج الاختبارات." /></div>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <div className="rounded-xl bg-[#F8FAFC] ring-1 ring-[#E2E8F0] p-3">
              <div className="text-[11px] font-bold text-[#64748B]">نسبة التحسّن</div>
              <div className="text-[20px] font-extrabold text-emerald-700 tabular-nums" dir="ltr">{l.improvement != null ? `+${l.improvement}%` : '—'}</div>
            </div>
            <div className="rounded-xl bg-[#F8FAFC] ring-1 ring-[#E2E8F0] p-3">
              <div className="text-[11px] font-bold text-[#64748B]">مسار المستوى</div>
              <div className="mt-1 flex items-center gap-1 text-[12.5px] font-extrabold text-[#1E3A8A]" dir="ltr">
                {l.trend.map((t, i) => <span key={i} className="flex items-center gap-1">{i > 0 && <span className="text-[#CBD5E1]">→</span>}{t.level}</span>)}
              </div>
            </div>
          </div>
          {l.nextStep && (
            <div className="mt-3 flex items-start gap-2.5 rounded-xl bg-blue-50 ring-1 ring-blue-200 p-3">
              <Target size={16} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-[12px] font-extrabold text-blue-800">الخطوة الموصى بها</div>
                <p className="text-[12.5px] text-[#334155] leading-relaxed">{l.nextStep}</p>
              </div>
            </div>
          )}
        </>
      )}
    </Surface>
  )
}

/* ── Payments ──────────────────────────────────────────── */

const PAY: Record<string, { label: string; tone: PillTone }> = {
  paid: { label: 'مدفوع', tone: 'ok' }, due: { label: 'مستحق قريباً', tone: 'warn' },
  overdue: { label: 'متأخر', tone: 'bad' }, pending: { label: 'قيد المراجعة', tone: 'info' },
}

export function PaymentSummary({ p }: { p: StudentProfile }) {
  const pay = p.payment
  const daysLeft = pay?.nextDueAt ? Math.ceil((new Date(pay.nextDueAt).getTime() - Date.now()) / 864e5) : null
  return (
    <Surface className="p-5 sm:p-6 h-full">
      <SectionHead title="ملخص الدفع" action={pay && <StatusPill tone={PAY[pay.status].tone}>{PAY[pay.status].label}</StatusPill>} />
      {!pay ? <Unavailable text="المدفوعات والفواتير تديرها الإدارة — لا تظهر في فضاء الأستاذ حمايةً لخصوصية الطالب." /> : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {([
              [Wallet, 'إجمالي المدفوع', mad(pay.totalPaid), 'emerald'],
              [CreditCard, 'المتبقي', mad(pay.balance), pay.balance ? 'rose' : 'stone'],
              [CalendarCheck, 'الدفعة القادمة', pay.nextDueAt ? fmtShort(pay.nextDueAt) : '—', 'gold'],
              [Receipt, 'آخر دفعة', pay.lastPaidAt ? fmtShort(pay.lastPaidAt) : '—', 'stone'],
            ] as [LucideIcon, string, string, Tone][]).map(([Icon, l, v, t]) => (
              <div key={l} className="rounded-xl bg-[#F8FAFC] ring-1 ring-[#E2E8F0] p-3">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${TONE[t]}`}><Icon size={14} /></span>
                <div className="mt-2 text-[15px] font-extrabold text-[#1E3A8A] tabular-nums">{v}</div>
                <div className="text-[11px] font-semibold text-[#64748B]">{l}</div>
              </div>
            ))}
          </div>
          {daysLeft != null && pay.balance > 0 && (
            <div className={`mt-3 rounded-xl px-3.5 py-2.5 text-[12.5px] font-bold ring-1
                             ${daysLeft < 0 ? 'bg-rose-50 text-rose-700 ring-rose-200' : 'bg-amber-50 text-amber-800 ring-amber-200'}`}>
              {daysLeft < 0 ? `القسط متأخر ${-daysLeft} يوماً` : `تذكير: القسط القادم (${mad(pay.balance)}) بعد ${daysLeft} أيام`}
            </div>
          )}
          <ul className="mt-4 divide-y divide-[#EEF2F7]">
            {pay.history.slice(0, 4).map(h => (
              <li key={h.id} className="flex items-center gap-3 py-2.5">
                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><FileText size={14} /></span>
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-bold text-[#1E3A8A] truncate">{h.label}</div>
                  <div className="text-[11px] text-[#94A3B8]">{fmtDay(h.at)}</div>
                </div>
                <span className="text-[12.5px] font-extrabold text-[#1E3A8A] tabular-nums">{mad(h.amount)}</span>
                <StatusPill tone={PAY[h.status].tone}>{PAY[h.status].label}</StatusPill>
                {h.receiptUrl && (
                  <a href={h.receiptUrl} target="_blank" rel="noopener noreferrer" aria-label="الإيصال"
                     className="w-7 h-7 rounded-lg ring-1 ring-[#E2E8F0] flex items-center justify-center text-blue-700 hover:bg-blue-50"><Download size={13} /></a>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </Surface>
  )
}

/* ── Teachers assigned ─────────────────────────────────── */

export function TeachersAssigned({ p, onMessage }: { p: StudentProfile; onMessage?: (teacherId: string) => void }) {
  return (
    <Surface className="p-5 sm:p-6 h-full">
      <SectionHead title="الأساتذة المسؤولون" />
      <ul className="space-y-2.5">
        {p.teachers.map(t => (
          <li key={t.id} className="flex items-center gap-3 rounded-2xl ring-1 ring-[#E2E8F0] p-3">
            <Face name={t.name} url={t.avatarUrl} size={44} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[13.5px] font-extrabold text-[#1E3A8A] truncate">{t.name}</span>
                {t.isMe && <StatusPill tone="info">أنت</StatusPill>}
              </div>
              <div className="text-[11.5px] font-bold text-amber-700">{t.role}</div>
              <div className="text-[11.5px] text-[#64748B] truncate">{t.specialty ?? '—'}</div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              {t.rating != null && (
                <span className="inline-flex items-center gap-0.5 text-[12px] font-bold text-[#334155]"><Star size={12} className="text-amber-400" fill="currentColor" />{t.rating.toFixed(1)}</span>
              )}
              {!t.isMe && onMessage && (
                <button onClick={() => onMessage(t.id)} className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-100">
                  <MessageCircle size={12} /> مراسلة
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      {p.teachers.length === 1 && p.teachers[0].isMe && (
        <p className="mt-3 text-[11.5px] text-[#94A3B8]">يظهر هنا الأساتذة الآخرون للطالب عند ربط بيانات الإدارة.</p>
      )}
    </Surface>
  )
}

/* ── Certificates & achievements ───────────────────────── */

const ACH: Record<string, { icon: LucideIcon; tone: Tone }> = {
  streak: { icon: Flame, tone: 'gold' }, milestone: { icon: Trophy, tone: 'violet' }, badge: { icon: Medal, tone: 'sky' },
}

export function Certificates({ p }: { p: StudentProfile }) {
  return (
    <Surface className="p-5 sm:p-6 h-full">
      <SectionHead title="الشهادات والإنجازات" />
      {p.certificates === null && p.achievements.length === 0 ? (
        <Unavailable text="الشهادات والشارات تُمنح من المنصة وتظهر هنا عند ربطها بفضاء الأستاذ." />
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-2.5">
            {(p.certificates ?? []).map(c => (
              <div key={c.id} className="flex items-center gap-3 rounded-2xl ring-1 ring-[#E2E8F0] p-3">
                <span className="w-11 h-12 rounded-lg bg-gradient-to-b from-amber-50 to-amber-100 ring-1 ring-amber-200 text-amber-700 flex items-center justify-center shrink-0"><Award size={19} /></span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-extrabold text-[#1E3A8A] truncate">{c.title}</div>
                  <div className="text-[11.5px] text-[#64748B]">صدرت {fmtDay(c.issuedAt)}</div>
                </div>
                <StatusPill tone="ok">مكتسبة</StatusPill>
                {c.url && (
                  <a href={c.url} target="_blank" rel="noopener noreferrer" aria-label="عرض الشهادة"
                     className="w-8 h-8 rounded-lg ring-1 ring-[#E2E8F0] flex items-center justify-center text-blue-700 hover:bg-blue-50"><Eye size={14} /></a>
                )}
              </div>
            ))}
            {p.nextCertificate && (
              <div className="rounded-2xl bg-blue-50 ring-1 ring-blue-200 p-3.5">
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className="font-extrabold text-blue-800 flex items-center gap-1.5"><GraduationCap size={15} /> الشهادة القادمة: {p.nextCertificate.title}</span>
                  <span className="font-extrabold text-blue-800 tabular-nums">{p.nextCertificate.pct}%</span>
                </div>
                <div className="mt-2"><Bar pct={p.nextCertificate.pct} /></div>
              </div>
            )}
          </div>
          <ul className="space-y-2">
            {p.achievements.length === 0
              ? <li className="text-[12.5px] text-[#94A3B8]">لا إنجازات بعد.</li>
              : p.achievements.map(a => {
                  const k = ACH[a.kind]
                  return (
                    <li key={a.title} className="flex items-center gap-3 rounded-xl bg-[#F8FAFC] ring-1 ring-[#E2E8F0] p-3">
                      <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${TONE[k.tone]}`}><k.icon size={16} /></span>
                      <span className="flex-1 text-[12.5px] font-bold text-[#1E3A8A]">{a.title}</span>
                      <span className="text-[11px] text-[#94A3B8]">{fmtShort(a.at)}</span>
                    </li>
                  )
                })}
          </ul>
        </div>
      )}
    </Surface>
  )
}

/* ── Activity feed ─────────────────────────────────────── */

const FEED: Record<StudentProfile['activity'][number]['kind'], { icon: LucideIcon; tone: Tone }> = {
  lesson: { icon: BookOpen, tone: 'stone' }, homework: { icon: PenLine, tone: 'violet' }, test: { icon: Check, tone: 'emerald' },
  note: { icon: StickyNote, tone: 'gold' }, streak: { icon: Flame, tone: 'gold' }, certificate: { icon: Award, tone: 'sky' },
  payment: { icon: CreditCard, tone: 'rose' }, attendance: { icon: CalendarCheck, tone: 'emerald' },
}

export function ActivityFeed({ p }: { p: StudentProfile }) {
  return (
    <Surface className="p-5 sm:p-6 h-full">
      <SectionHead title="آخر النشاطات" />
      {p.activity.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-[#94A3B8]">لا نشاط بعد.</p>
      ) : (
        <ol className="relative space-y-3.5 before:absolute before:right-[17px] before:top-2 before:bottom-2 before:w-px before:bg-[#E2E8F0]">
          {p.activity.slice(0, 8).map((a, i) => {
            const f = FEED[a.kind]
            return (
              <li key={i} className="relative flex gap-3">
                <span className={`relative w-9 h-9 rounded-full flex items-center justify-center shrink-0 ring-4 ring-white ${TONE[f.tone]}`}><f.icon size={15} /></span>
                <div className="min-w-0 pt-0.5">
                  <div className="text-[13px] font-extrabold text-[#1E3A8A]">{a.title}</div>
                  <div className="text-[12px] text-[#64748B] truncate">{a.sub}</div>
                  <div className="text-[11px] font-semibold text-[#94A3B8]">{fmtShort(a.at)} · {fmtHour(a.at)}</div>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </Surface>
  )
}

/* ── Parent / family view ──────────────────────────────── */

/** A compact summary a teacher can read to a parent — or copy and send. */
export function ParentView({ p }: { p: StudentProfile }) {
  const a = attendanceStats(p)
  const next = upcomingSessions(p).slice(0, 2)
  const [copied, setCopied] = useState(false)
  const first = p.name.split(' ')[0]

  const text = [
    `ملخص ${p.name} — إنجليزي.كوم`,
    p.level && `المستوى الحالي: ${p.level}${p.goalLevel ? ` (الهدف ${p.goalLevel})` : ''}`,
    p.learning && `التقدّم في ${p.learning.course}: ${p.learning.progressPct}%`,
    a.rate != null && `نسبة الحضور: ${a.rate}% (${a.attended} حضور، ${a.absent} غياب)`,
    next[0] && `الحصة القادمة: ${new Date(next[0].startsAt).toLocaleDateString('ar-MA', { weekday: 'long', day: 'numeric', month: 'long' })} ${fmtHour(next[0].startsAt)}`,
    p.summary.notes[0] && `ملاحظة الأستاذ: ${p.summary.notes[0].text}`,
  ].filter(Boolean).join('\n')

  async function copy() {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch {}
  }

  return (
    <Surface className="p-5 sm:p-6 h-full">
      <SectionHead title="نظرة لولي الأمر" action={
        <button onClick={copy} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-1.5 text-[12px] font-bold text-blue-700 hover:bg-blue-100">
          {copied ? <Check size={13} /> : <ClipboardCopy size={13} />} {copied ? 'تم النسخ' : 'نسخ الملخص'}
        </button>} />
      <div className="rounded-2xl bg-gradient-to-br from-blue-50 via-white to-amber-50/60 ring-1 ring-[#E2E8F0] p-4">
        <p className="text-[13.5px] leading-relaxed text-[#334155]">
          <b className="text-[#1E3A8A]">{first}</b>
          {p.level ? <> في المستوى <b dir="ltr">{p.level}</b></> : null}
          {a.rate != null ? <>، يحضر <b>{a.rate}%</b> من الحصص</> : null}
          {p.learning ? <>، وأنجز <b>{p.learning.progressPct}%</b> من دورته الحالية</> : null}.
          {p.summary.motivation === 'high' && ' مستواه في تحسّن مستمر ومشاركته ممتازة.'}
          {p.summary.motivation === 'low' && ' يحتاج إلى تشجيع إضافي هذا الشهر.'}
        </p>
      </div>
      <div className="mt-4 grid sm:grid-cols-2 gap-3">
        <div>
          <div className="mb-2 text-[12px] font-bold text-[#64748B] flex items-center gap-1.5"><CalendarCheck size={13} className="text-blue-600" /> الحصص القادمة</div>
          {next.length === 0 ? <p className="text-[12px] text-[#94A3B8]">لا حصص قادمة.</p> : next.map(s => (
            <div key={s.id} className="mb-1.5 rounded-xl bg-[#F8FAFC] ring-1 ring-[#E2E8F0] px-3 py-2 text-[12px]">
              <div className="font-bold text-[#1E3A8A] truncate">{s.title}</div>
              <div className="text-[#64748B]">{fmtShort(s.startsAt)} · {fmtHour(s.startsAt)} · {s.teacher}</div>
            </div>
          ))}
        </div>
        <div>
          <div className="mb-2 text-[12px] font-bold text-[#64748B] flex items-center gap-1.5"><Users size={13} className="text-blue-600" /> للتواصل</div>
          {p.teachers.slice(0, 2).map(t => (
            <div key={t.id} className="mb-1.5 flex items-center gap-2 rounded-xl bg-[#F8FAFC] ring-1 ring-[#E2E8F0] px-3 py-2">
              <Face name={t.name} url={t.avatarUrl} size={26} />
              <div className="min-w-0 text-[12px]"><div className="font-bold text-[#1E3A8A] truncate">{t.name}</div><div className="text-[#64748B] truncate">{t.role}</div></div>
            </div>
          ))}
          {p.payment && p.payment.balance > 0 && p.payment.nextDueAt && (
            <div className="mt-1 rounded-xl bg-amber-50 ring-1 ring-amber-200 px-3 py-2 text-[11.5px] font-bold text-amber-800">
              تذكير الدفع: {mad(p.payment.balance)} قبل {fmtShort(p.payment.nextDueAt)}
            </div>
          )}
        </div>
      </div>
    </Surface>
  )
}
