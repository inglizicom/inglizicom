'use client'

import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import {
  BookOpen, CalendarCheck, CalendarX, CheckCircle2, CreditCard, Crown, Flame, GraduationCap,
  Lock, PauseCircle, PenLine, PlayCircle, Sparkles, Target, Timer, TrendingUp, Wallet,
} from 'lucide-react'
import { Spark } from '@/app/teacher/_charts'
import { Face, SectionHead, Surface, TONE, type Tone } from '@/app/teacher/_kit'
import { attendanceStats, type StudentProfile, type StudentStatus } from '@/lib/student-profile'

/** Shared bits for the student profile sections. */

export const fmtDay = (iso: string) => new Date(iso).toLocaleDateString('ar-MA', { day: 'numeric', month: 'short', year: 'numeric' })
export const fmtShort = (iso: string) => new Date(iso).toLocaleDateString('ar-MA', { day: 'numeric', month: 'short' })
export const fmtHour = (iso: string) => new Date(iso).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })
export const mad = (n: number) => `${n.toLocaleString('en-US')} درهم`

/** A block the current viewer has no data for — said once, calmly. */
export function Unavailable({ text = 'تُدار هذه المعلومات من الإدارة ولا تظهر في فضاء الأستاذ.' }: { text?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-5">
      <span className="w-9 h-9 rounded-xl bg-white ring-1 ring-[#E2E8F0] text-[#94A3B8] flex items-center justify-center shrink-0"><Lock size={16} /></span>
      <p className="text-[12.5px] font-semibold text-[#64748B] leading-relaxed">{text}</p>
    </div>
  )
}

export function Bar({ pct, cls = 'bg-gradient-to-l from-blue-500 to-blue-700', h = 'h-2' }: { pct: number; cls?: string; h?: string }) {
  return (
    <div className={`w-full ${h} rounded-full bg-[#E2E8F0] overflow-hidden`}>
      <div className={`h-full rounded-full ${cls} transition-all duration-700`} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
    </div>
  )
}

/* ── Identity ──────────────────────────────────────────── */

const STATUS: Record<StudentStatus, { label: string; cls: string; icon: LucideIcon }> = {
  active:           { label: 'نشط',           cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200', icon: CheckCircle2 },
  paused:           { label: 'متوقف',         cls: 'bg-slate-100 text-slate-600 ring-slate-200',     icon: PauseCircle },
  vip:              { label: 'VIP',            cls: 'bg-gradient-to-l from-amber-400 to-yellow-500 text-blue-900 ring-amber-300', icon: Crown },
  trial:            { label: 'حصة تجريبية',   cls: 'bg-sky-50 text-sky-700 ring-sky-200',            icon: Sparkles },
  awaiting_payment: { label: 'بانتظار الدفع', cls: 'bg-rose-50 text-rose-700 ring-rose-200',         icon: CreditCard },
}

export interface Action { label: string; icon: LucideIcon; href?: string; onClick?: () => void; primary?: boolean; external?: boolean }

function ActionBtn({ a }: { a: Action }) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-bold transition whitespace-nowrap ${
    a.primary ? 'bg-gradient-to-l from-amber-400 to-yellow-500 text-blue-900 ring-1 ring-amber-300 shadow-lg shadow-amber-500/25'
              : 'bg-white text-[#334155] ring-1 ring-[#E2E8F0] hover:ring-blue-300 hover:text-blue-700'}`
  const inner = <><a.icon size={15} />{a.label}</>
  if (a.href && a.external) return <a href={a.href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
  if (a.href) return <Link href={a.href} className={cls}>{inner}</Link>
  return <button type="button" onClick={a.onClick} className={cls}>{inner}</button>
}

export function IdentityBar({ p, actions }: { p: StudentProfile; actions: Action[] }) {
  return (
    <Surface className="p-5 sm:p-7">
      <div className="flex flex-col lg:flex-row lg:items-center gap-5">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <Face name={p.name} url={p.avatarUrl} size={88} className="ring-4 ring-blue-50 shadow-lg !text-[30px]" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[24px] sm:text-[28px] font-extrabold tracking-tight text-[#1E3A8A] truncate">{p.name}</h1>
              {p.statuses.map(s => {
                const st = STATUS[s]
                return (
                  <span key={s} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-bold ring-1 ${st.cls}`}>
                    <st.icon size={12} /> {st.label}
                  </span>
                )
              })}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-[#475569]">
              {p.level && (
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap size={15} className="text-blue-600" /> المستوى <b className="text-[#1E3A8A]" dir="ltr">{p.level}</b>
                  {p.goalLevel && <span className="text-[#94A3B8]">← الهدف <span dir="ltr">{p.goalLevel}</span></span>}
                </span>
              )}
              {p.enrolledAt && (
                <span className="inline-flex items-center gap-1.5"><CalendarCheck size={15} className="text-blue-600" /> مسجّل منذ {fmtDay(p.enrolledAt)}</span>
              )}
              {p.phoneMasked && <span className="inline-flex items-center gap-1.5 text-[#64748B]" dir="ltr">{p.phoneMasked}</span>}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {actions.map(a => <ActionBtn key={a.label} a={a} />)}
        </div>
      </div>
    </Surface>
  )
}

/* ── KPIs ──────────────────────────────────────────────── */

function Tile({ icon: Icon, tone, label, value, sub }: { icon: LucideIcon; tone: Tone; label: string; value: React.ReactNode; sub?: string }) {
  const empty = value == null || value === '—'
  return (
    <div className="rounded-[18px] bg-white ring-1 ring-[#D6DFEC] shadow-[0_1px_3px_rgba(30,58,138,.08),0_10px_26px_-12px_rgba(30,58,138,.22)] p-4">
      <div className="flex items-center gap-2.5">
        <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${TONE[tone]}`}><Icon size={16} /></span>
        <span className="text-[12px] font-bold text-[#475569] leading-tight">{label}</span>
      </div>
      <div className={`mt-3 text-[22px] font-extrabold tracking-tight leading-none tabular-nums ${empty ? 'text-[#CBD5E1]' : 'text-[#1E3A8A]'}`}>
        {empty ? '—' : value}
      </div>
      {sub && <div className="mt-1 text-[11.5px] font-medium text-[#94A3B8] truncate">{sub}</div>}
    </div>
  )
}

export function KpiGrid({ p }: { p: StudentProfile }) {
  const a = attendanceStats(p)
  const st = p.study
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <Tile icon={CalendarCheck} tone="emerald" label="حصص حضرها" value={a.attended} sub={`${a.late} متأخراً`} />
      <Tile icon={CalendarX} tone="rose" label="حصص فاتته" value={a.absent} sub={a.excused ? `${a.excused} بعذر` : 'بدون عذر'} />
      <Tile icon={BookOpen} tone="stone" label="دروس مكتملة" value={st?.lessonsCompleted} sub={st ? undefined : 'غير متاح'} />
      <Tile icon={PenLine} tone="violet" label="تمارين منجزة" value={st?.exercises} sub={st ? `${st.quizzesPassed} اختباراً ناجحاً` : 'غير متاح'} />
      <Tile icon={PlayCircle} tone="sky" label="ساعات مشاهدة" value={st ? <>{st.hoursWatched}<span className="text-[13px] text-[#94A3B8]"> س</span></> : null} sub={st ? `${st.videosWatched} فيديو` : 'غير متاح'} />
      <Tile icon={TrendingUp} tone="stone" label="تقدّم الدورة" value={p.learning ? `${p.learning.progressPct}%` : null} sub={p.learning?.course ?? 'غير متاح'} />
      <Tile icon={Wallet} tone="emerald" label="المبلغ المدفوع" value={p.payment ? mad(p.payment.totalPaid) : null} sub={p.payment ? undefined : 'تديره الإدارة'} />
      <Tile icon={CreditCard} tone="gold" label="الدفعة القادمة" value={p.payment?.nextDueAt ? fmtShort(p.payment.nextDueAt) : null}
            sub={p.payment ? (p.payment.balance ? mad(p.payment.balance) : 'لا مستحقات') : 'تديره الإدارة'} />
      <Tile icon={Target} tone="violet" label="نسبة تحقيق الهدف" value={st?.targetPct != null ? `${st.targetPct}%` : null} sub={p.goalLevel ? `نحو ${p.goalLevel}` : 'غير محدد'} />
      <Tile icon={Flame} tone="gold" label="نسبة الحضور" value={a.rate != null ? `${a.rate}%` : null} sub={a.streak ? `سلسلة ${a.streak} حصص` : undefined} />
    </div>
  )
}

/* ── Current learning state ────────────────────────────── */

export function LearningState({ p }: { p: StudentProfile }) {
  const l = p.learning
  return (
    <Surface className="p-5 sm:p-6 h-full">
      <SectionHead title="الوضع الدراسي الحالي" />
      {!l ? (
        <div className="space-y-4">
          {p.courses.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {p.courses.map(c => (
                <span key={c.title} className={`rounded-lg px-3 py-1.5 text-[12.5px] font-bold ring-1 ${c.status === 'active' ? 'bg-blue-50 text-blue-700 ring-blue-100' : 'bg-slate-50 text-slate-500 ring-slate-200'}`}>
                  {c.title} · {c.status === 'active' ? 'نشط' : 'مكتمل'}
                </span>
              ))}
            </div>
          )}
          <Unavailable text="تقدّم الدروس والوحدات يظهر هنا عند ربط بيانات المنصة بفضاء الأستاذ." />
        </div>
      ) : (
        <>
          <div className="flex items-start gap-4">
            <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-700/30">
              <BookOpen size={24} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[17px] font-extrabold text-[#1E3A8A]">{l.course}</div>
              <div className="mt-0.5 text-[12.5px] text-[#64748B]">{[l.unit, l.lesson].filter(Boolean).join(' · ')}</div>
              {l.teacher && <div className="mt-0.5 text-[12px] font-semibold text-[#475569]">مع {l.teacher}</div>}
            </div>
            <div className="text-left">
              <div className="text-[26px] font-extrabold text-[#1E3A8A] tabular-nums leading-none">{l.progressPct}%</div>
              <div className="text-[11px] font-semibold text-[#94A3B8] mt-1">مكتمل</div>
            </div>
          </div>
          <div className="mt-4"><Bar pct={l.progressPct} h="h-2.5" /></div>
          <div className="mt-5 grid sm:grid-cols-3 gap-3">
            <div className="rounded-2xl bg-[#F8FAFC] ring-1 ring-[#E2E8F0] p-3.5">
              <div className="flex items-center gap-1.5 text-[11.5px] font-bold text-[#64748B]"><Target size={13} className="text-amber-500" /> المحطة القادمة</div>
              <div className="mt-1.5 text-[13px] font-bold text-[#1E3A8A] leading-snug">{l.nextMilestone ?? '—'}</div>
            </div>
            <div className="rounded-2xl bg-[#F8FAFC] ring-1 ring-[#E2E8F0] p-3.5">
              <div className="flex items-center gap-1.5 text-[11.5px] font-bold text-[#64748B]"><Timer size={13} className="text-blue-600" /> هذا الأسبوع</div>
              <div className="mt-1.5 text-[20px] font-extrabold text-[#1E3A8A] tabular-nums">{Math.round(l.weekMinutes / 6) / 10} <span className="text-[12px] text-[#94A3B8]">ساعة</span></div>
            </div>
            <div className="rounded-2xl bg-[#F8FAFC] ring-1 ring-[#E2E8F0] p-3.5">
              <div className="flex items-center gap-1.5 text-[11.5px] font-bold text-[#64748B]"><TrendingUp size={13} className="text-emerald-600" /> منحنى الإنجاز</div>
              <div className="mt-2"><Spark data={l.trend} color="#16A34A" /></div>
            </div>
          </div>
        </>
      )}
    </Surface>
  )
}

/* ── Smart actions ─────────────────────────────────────── */

export function SmartActions({ actions }: { actions: Action[] }) {
  return (
    <Surface className="p-5 sm:p-6">
      <SectionHead title="إجراءات سريعة" />
      <div className="grid grid-cols-2 gap-2">
        {actions.map(a => {
          const cls = `flex flex-col items-center justify-center gap-1.5 rounded-2xl py-3.5 text-[12.5px] font-bold text-center transition ${
            a.primary ? 'bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-md shadow-blue-700/30'
                      : 'bg-[#F8FAFC] ring-1 ring-[#E2E8F0] text-[#334155] hover:ring-blue-300 hover:text-blue-700'}`
          const inner = <><a.icon size={19} className={a.primary ? 'text-amber-300' : 'text-blue-600'} />{a.label}</>
          if (a.href && a.external) return <a key={a.label} href={a.href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
          if (a.href) return <Link key={a.label} href={a.href} className={cls}>{inner}</Link>
          return <button key={a.label} type="button" onClick={a.onClick} className={cls}>{inner}</button>
        })}
      </div>
    </Surface>
  )
}

/* ── Student summary ───────────────────────────────────── */

const MOTIVATION = {
  high:   { label: 'متحمّس جداً', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  steady: { label: 'منتظم',       cls: 'bg-blue-50 text-blue-700 ring-blue-200' },
  low:    { label: 'يحتاج تشجيعاً', cls: 'bg-amber-50 text-amber-800 ring-amber-200' },
} as const

export function StudentSummary({ p }: { p: StudentProfile }) {
  const s = p.summary
  const rows = [
    { k: 'الهدف', v: s.goal },
    { k: 'أسلوب التعلّم', v: s.learningStyle },
    { k: 'المهارة المفضّلة', v: s.favoriteSkill },
    { k: 'متوسط المشاركة', v: s.participationAvg != null ? `${s.participationAvg} / 5` : null },
  ].filter(r => r.v)
  return (
    <Surface className="p-5 sm:p-6">
      <SectionHead title="ملخص الطالب" action={s.motivation && (
        <span className={`rounded-full px-2.5 py-1 text-[11.5px] font-bold ring-1 ${MOTIVATION[s.motivation].cls}`}>{MOTIVATION[s.motivation].label}</span>
      )} />
      {rows.length === 0 && s.notes.length === 0 ? (
        <p className="text-[12.5px] text-[#94A3B8] leading-relaxed">يتكوّن الملخص من ملاحظاتك في تقارير الحصص — اكتب ملاحظة عن الطالب في تقريرك القادم.</p>
      ) : (
        <>
          {rows.length > 0 && (
            <dl className="space-y-2.5">
              {rows.map(r => (
                <div key={r.k} className="flex items-start justify-between gap-3 text-[12.5px]">
                  <dt className="font-bold text-[#64748B] shrink-0">{r.k}</dt>
                  <dd className="font-semibold text-[#1E3A8A] text-left">{r.v}</dd>
                </div>
              ))}
            </dl>
          )}
          {s.needsHelp && (
            <div className="mt-3 rounded-xl bg-amber-50 ring-1 ring-amber-200 px-3 py-2 text-[12px] font-bold text-amber-800">يحتاج مساعدة إضافية حسب آخر التقارير.</div>
          )}
          {s.notes.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="text-[11.5px] font-bold text-[#94A3B8]">ملاحظات الأساتذة</div>
              {s.notes.slice(0, 3).map((n, i) => (
                <div key={i} className="rounded-xl bg-[#F8FAFC] ring-1 ring-[#E2E8F0] p-3">
                  <p className="text-[12.5px] text-[#334155] leading-relaxed">{n.text}</p>
                  <div className="mt-1 text-[11px] text-[#94A3B8]">{n.by} · {fmtShort(n.at)}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Surface>
  )
}

