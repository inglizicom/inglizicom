'use client'

import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Activity, Award, BookOpen, CalendarCheck, CalendarX, Check, CheckCircle2, ClipboardCopy, Clock, CreditCard, Download,
  Flame, GraduationCap, Heart, KeyRound, MessageCircle, PenLine, PlayCircle, Receipt, Share2, Star, Target, Trophy, UserRound,
  Users, Wallet,
} from 'lucide-react'
import {
  classifyTracks, exercisesDone, hoursFrom, learningStatus, sessionsSplit, type StudentDashboard,
} from '@/lib/student-dashboard'
import type { StudentCert } from '@/lib/certificates'
import {
  Bar, Empty, Face, IdentityHeader, Kpi, Panel, PanelHead, Pill, Ring, fmtDay, fmtHour, mad, type PillTone,
} from './ui'

/**
 * ملفي — the personal and family dashboard.
 *
 * Who I am on the platform, how I attend, what I paid and what is next, my
 * teachers, what I earned, and a plain summary a parent can read — or receive
 * on WhatsApp in one tap.
 */

export interface ProfileNotes { adminMessage: string | null; nextTask: string | null; examNotes: { title: string; note: string }[] }
export interface FinalCertificate { cert_number: string; level: string; percent: number; date: string }
export interface RecentEvent { event_type: string; entity_title: string | null; created_at: string }

const PAY: Record<string, { label: string; tone: PillTone }> = {
  paid: { label: 'مُسدَّد', tone: 'ok' }, due: { label: 'دفعة قريبة', tone: 'warn' },
  overdue: { label: 'متأخر', tone: 'bad' }, none: { label: 'لا دفعات', tone: 'muted' },
  pending: { label: 'مستحق', tone: 'warn' }, declined: { label: 'مرفوض', tone: 'muted' },
}

const EVENT: Record<string, { ar: string; icon: LucideIcon; tone: string }> = {
  opened_lesson:          { ar: 'فتح درسًا',          icon: BookOpen,     tone: 'bg-amber-50 text-amber-700' },
  completed_lesson:       { ar: 'أكمل درسًا',         icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-700' },
  completed_quiz:         { ar: 'نجح في اختبار',      icon: Award,        tone: 'bg-emerald-50 text-emerald-700' },
  passed_unit_exam:       { ar: 'نجح في امتحان وحدة', icon: Trophy,       tone: 'bg-amber-50 text-amber-800' },
  completed_challenge:    { ar: 'تدرّب',              icon: Target,       tone: 'bg-stone-100 text-stone-700' },
  vocab_game:             { ar: 'لعبة مفردات',        icon: Star,         tone: 'bg-stone-100 text-stone-700' },
  submitted_conversation: { ar: 'سلّم محادثة الوحدة', icon: PenLine,      tone: 'bg-orange-50 text-orange-700' },
  opened_reading:         { ar: 'قرأ نص الوحدة',      icon: BookOpen,     tone: 'bg-amber-50 text-amber-700' },
  completed_reading_quiz: { ar: 'أنهى القراءة',       icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-700' },
  downloaded_file:        { ar: 'حمّل ملفًا',         icon: Download,     tone: 'bg-stone-100 text-stone-700' },
  watched_video:          { ar: 'شاهد فيديو',         icon: PlayCircle,   tone: 'bg-sky-50 text-sky-700' },
  completed_exercise:     { ar: 'أنجز مهمة',          icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-700' },
  reward_claim:           { ar: 'استبدل مكافأة',      icon: Heart,        tone: 'bg-rose-50 text-rose-700' },
  attendance:             { ar: 'حصة مباشرة',         icon: CalendarCheck, tone: 'bg-stone-100 text-stone-700' },
  payment:                { ar: 'دفعة',               icon: Wallet,       tone: 'bg-emerald-50 text-emerald-700' },
  certificate:            { ar: 'شهادة جديدة',        icon: GraduationCap, tone: 'bg-amber-50 text-amber-800' },
}

export default function MyProfile({ dash, name, avatarUrl, level, certs, finalCert, recent, notes, onCourses }: {
  dash: StudentDashboard; name: string; avatarUrl: string | null
  level: { current: string | null; next: string | null; stage: string | null }
  certs: StudentCert[]; finalCert: FinalCertificate | null; recent: RecentEvent[]; notes: ProfileNotes
  onCourses: () => void
}) {
  const [copied, setCopied] = useState(false)
  const tracks = classifyTracks(dash)
  const { upcoming } = sessionsSplit(dash)
  const att = dash.attendance
  const pay = dash.payments
  const study = dash.study
  const status = learningStatus(dash)
  const first = name.split(' ')[0]
  const currentLevel = level.current ?? tracks.activeCourses[0]?.level ?? tracks.activeSeats[0]?.level ?? null
  const course = tracks.activeCourses[0]
  const coursePct = course ? Math.round((course.lessons_done / Math.max(1, course.lessons_total)) * 100) : null
  const daysToPay = pay?.next_due_at ? Math.ceil((new Date(pay.next_due_at).getTime() - Date.now()) / 864e5) : null
  const certCount = certs.length + (finalCert ? 1 : 0)

  // family summary — plain sentences, ready to send
  const summary = [
    `ملخص ${name} — إنجليزي.كوم`,
    `المسار: ${tracks.label}${currentLevel ? ` · المستوى ${currentLevel}` : ''}`,
    course && coursePct != null && `الدورة: ${course.title} — ${coursePct}% (${course.lessons_done}/${course.lessons_total} درس)`,
    att?.rate != null && `الحضور: ${att.rate}% · ${att.absent} غياب`,
    study && `هذا الأسبوع: ${study.active_days_7} أيام دراسة · ${exercisesDone(dash)} تمرين منجز إجمالاً`,
    upcoming[0] && `الحصة القادمة: ${new Date(upcoming[0].starts_at).toLocaleDateString('ar-MA', { weekday: 'long', day: 'numeric', month: 'long' })} ${fmtHour(upcoming[0].starts_at)}`,
    pay && pay.status !== 'none' && `الدفع: ${PAY[pay.status].label}${pay.next_due_at ? ` · القادمة ${fmtDay(pay.next_due_at)}` : ''}`,
  ].filter(Boolean).join('\n')

  async function copySummary() {
    try { await navigator.clipboard.writeText(summary); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch {}
  }
  const shareWa = () => window.open(`https://wa.me/?text=${encodeURIComponent(summary)}`, '_blank', 'noopener')

  // recent activity: platform events + live classes + payments + certificates, newest first
  const feed = [
    ...recent.filter(r => r.event_type !== 'login').map(r => ({ kind: r.event_type, sub: r.entity_title ?? '', at: r.created_at })),
    ...(att?.recent ?? []).map(r => ({ kind: 'attendance', sub: `${r.title} — ${r.status === 'absent' ? 'غياب' : r.status === 'late' ? 'تأخّر' : r.status === 'excused' ? 'غياب بعذر' : 'حضور'}`, at: r.at })),
    ...(pay?.history ?? []).filter(h => h.status === 'paid').map(h => ({ kind: 'payment', sub: `${h.label} · ${mad(h.amount)}`, at: h.at })),
    ...certs.map(c => ({ kind: 'certificate', sub: c.title, at: c.date })),
  ].sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 10)

  return (
    <div className="space-y-5">
      {/* 1 — identity */}
      <IdentityHeader name={name} avatarUrl={avatarUrl} trackLabel={tracks.label} kinds={tracks.kinds}
        level={currentLevel} enrolledAt={dash.student?.enrollment_date ?? null} statusLabel={status.label}
        actions={[
          { label: 'دوراتي', icon: BookOpen, onClick: onCourses, primary: true },
          { label: 'شارك مع الأسرة', icon: Share2, onClick: shareWa },
        ]} />

      {/* 2 — KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi icon={CalendarCheck} tone="green" label="نسبة الحضور" value={att?.rate != null ? `${att.rate}%` : null} sub={att?.marks ? `${att.present + att.late} من ${att.marks - att.excused} حصة` : 'لا حصص مباشرة بعد'} />
        <Kpi icon={CalendarX} tone="rose" label="حصص فائتة" value={att?.marks ? att.absent : null} sub={att?.excused ? `${att.excused} بعذر` : undefined} />
        <Kpi icon={CheckCircle2} tone="gold" label="تمارين منجزة" value={exercisesDone(dash)} sub={study ? `${study.practice_correct.toLocaleString('en-US')} إجابة تدريب صحيحة` : undefined} />
        <Kpi icon={PlayCircle} tone="blue" label="ساعات المشاهدة" value={study?.watch_minutes ? hoursFrom(study.watch_minutes) : null} sub={`${study?.videos_completed ?? 0} فيديو مكتمل`} />
        <Kpi icon={CreditCard} tone={pay?.status === 'overdue' ? 'rose' : pay?.status === 'due' ? 'gold' : 'green'} label="حالة الدفع"
             value={pay ? <span className="text-[17px]">{PAY[pay.status].label}</span> : null} sub={pay?.outstanding ? `متبقٍّ ${mad(pay.outstanding)}` : undefined} />
        <Kpi icon={Clock} tone="brown" label="الدفعة القادمة" value={pay?.next_due_at ? <span className="text-[17px]">{fmtDay(pay.next_due_at)}</span> : null}
             sub={pay?.monthly_fee ? `اشتراك ${mad(pay.monthly_fee)}` : daysToPay != null ? (daysToPay < 0 ? `متأخرة ${-daysToPay} يومًا` : `بعد ${daysToPay} أيام`) : undefined} />
        <Kpi icon={Wallet} tone="green" label="المبلغ المدفوع" value={pay ? <span className="text-[18px]">{Number(pay.total_paid).toLocaleString('en-US')}</span> : null} sub={pay ? `درهم · ${pay.paid_count} دفعة` : undefined} />
        <Kpi icon={GraduationCap} tone="gold" label="الشهادات" value={certCount} sub={study?.streak ? `🔥 ${study.streak.current} أيام متتالية` : undefined} />
      </div>

      {/* 3 — attendance + payments */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel className="p-5">
          <PanelHead icon={CalendarCheck} title="الحضور والحصص الفائتة" sub={tracks.activeSeats.length ? `${tracks.activeSeats.length} قسم مباشر نشط` : 'الحضور يخص الحصص المباشرة'} />
          {!att?.marks ? <Empty icon={Users} text="لا حصص مباشرة مسجّلة بعد" hint={tracks.course ? 'أنت تتعلم بالدورة الذاتية — تقدّمك في «دوراتي».' : undefined} /> : (
            <>
              <div className="flex items-center gap-5">
                <Ring pct={att.rate ?? 0} size={104} label="حضور" stroke="#059669" />
                <div className="flex-1 space-y-2">
                  {[{ l: 'حاضر', v: att.present, c: 'bg-emerald-500' }, { l: 'متأخر', v: att.late, c: 'bg-amber-500' }, { l: 'غائب', v: att.absent, c: 'bg-rose-500' }].map(x => (
                    <div key={x.l} className="flex items-center gap-2 text-[12px]">
                      <span className="w-10 font-bold text-[#5A3E28]">{x.l}</span>
                      <Bar pct={(x.v / Math.max(1, att.marks)) * 100} cls={x.c} />
                      <b className="w-6 text-left tabular-nums">{x.v}</b>
                    </div>
                  ))}
                </div>
              </div>
              <ul className="mt-4 divide-y divide-[#EFE8DD]">
                {att.recent.slice(0, 5).map((r, i) => (
                  <li key={i} className="flex items-center gap-2.5 py-2 text-[12.5px]">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${r.status === 'absent' ? 'bg-rose-500' : r.status === 'late' ? 'bg-amber-500' : r.status === 'excused' ? 'bg-stone-400' : 'bg-emerald-500'}`} />
                    <span className="min-w-0 flex-1 truncate font-semibold text-[#1F1A16]">{r.title}</span>
                    <span className="shrink-0 text-[11px] text-[#A89B8C]">{fmtDay(r.at)}{r.note ? ` · ${r.note}` : ''}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Panel>

        <Panel className="p-5" id="payments">
          <PanelHead icon={Wallet} title="المدفوعات" action={pay && <Pill tone={PAY[pay.status].tone}>{PAY[pay.status].label}</Pill>} />
          {!pay || (pay.history.length === 0 && !pay.monthly_fee) ? <Empty icon={Receipt} text="لا دفعات مسجّلة" hint="تظهر هنا كل دفعة تسجّلها الإدارة." /> : (
            <>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-emerald-50 p-3 ring-1 ring-emerald-100"><div className="text-[10.5px] font-bold text-emerald-800">المدفوع</div><div className="mt-0.5 text-[16px] font-black tabular-nums text-emerald-900">{Number(pay.total_paid).toLocaleString('en-US')}</div></div>
                <div className={`rounded-xl p-3 ring-1 ${pay.outstanding ? 'bg-amber-50 ring-amber-100' : 'bg-[#FBF8F3] ring-[#ECE4D8]'}`}><div className="text-[10.5px] font-bold text-amber-900">المتبقي</div><div className="mt-0.5 text-[16px] font-black tabular-nums text-[#1F1A16]">{Number(pay.outstanding).toLocaleString('en-US')}</div></div>
                <div className="rounded-xl bg-[#FBF8F3] p-3 ring-1 ring-[#ECE4D8]"><div className="text-[10.5px] font-bold text-[#7A6E62]">الدفعة القادمة</div><div className="mt-0.5 text-[14px] font-black text-[#1F1A16]">{pay.next_due_at ? fmtDay(pay.next_due_at) : '—'}</div></div>
              </div>
              {daysToPay != null && (pay.outstanding > 0 || pay.monthly_fee) && (
                <div className={`mt-3 rounded-xl px-3 py-2 text-[12px] font-bold ring-1 ${daysToPay < 0 ? 'bg-rose-50 text-rose-800 ring-rose-200' : 'bg-amber-50 text-amber-900 ring-amber-200'}`}>
                  {daysToPay < 0 ? `الدفعة متأخرة ${-daysToPay} يومًا — تواصل مع الإدارة.` : `تذكير: الدفعة القادمة بعد ${daysToPay} أيام.`}
                </div>
              )}
              <ul className="mt-3 divide-y divide-[#EFE8DD]">
                {pay.history.slice(0, 5).map(h => (
                  <li key={h.id} className="flex items-center gap-2.5 py-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FBF8F3] text-[#B8862E] ring-1 ring-[#ECE4D8]"><Receipt size={14} /></span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12.5px] font-bold text-[#1F1A16]">{h.label}</div>
                      <div className="text-[11px] text-[#A89B8C]">{fmtDay(h.at)}{h.installment ? ` · القسط ${h.installment}` : ''}</div>
                    </div>
                    <span className="text-[12.5px] font-black tabular-nums text-[#1F1A16]">{Number(h.amount).toLocaleString('en-US')}</span>
                    <Pill tone={PAY[h.status]?.tone ?? 'muted'}>{PAY[h.status]?.label ?? h.status}</Pill>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Panel>
      </div>

      {/* 4 — teachers + certificates */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel className="p-5">
          <PanelHead icon={UserRound} title="أساتذتي" />
          {(dash.teachers ?? []).length === 0 ? <Empty icon={UserRound} text="لم يُسنَد إليك أستاذ بعد" /> : (
            <ul className="space-y-2.5">
              {(dash.teachers ?? []).map(t => (
                <li key={t.id} className="flex items-center gap-3 rounded-2xl bg-[#FBF8F3] p-3 ring-1 ring-[#ECE4D8]">
                  <Face name={t.name ?? 'أستاذ'} url={t.avatar_url} size={44} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-extrabold text-[#1F1A16]">{t.name ?? 'أستاذ'}</div>
                    <div className="truncate text-[11.5px] font-bold text-[#B8862E]">{[t.assigned && 'الأستاذ المسؤول', ...t.classes.map(c => `أستاذ ${c}`)].filter(Boolean).join(' · ')}</div>
                    {t.specialties.length > 0 && <div className="truncate text-[11.5px] text-[#7A6E62]">{t.specialties.slice(0, 3).join(' · ')}</div>}
                  </div>
                  <div className="text-left">
                    {t.rating_count ? <div className="inline-flex items-center gap-0.5 text-[12px] font-bold text-[#5A3E28]"><Star size={12} className="text-amber-400" fill="currentColor" />{Number(t.rating_avg).toFixed(1)}</div> : null}
                    {t.my_rating ? <div className="text-[10.5px] text-[#A89B8C]">تقييمك {t.my_rating}★</div> : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel className="p-5" id="certificates">
          <PanelHead icon={Award} title="الشهادات والإنجازات" sub={certCount ? `${certCount} شهادة` : undefined} />
          <div className="space-y-2.5">
            {finalCert && (
              <a href={`/certificate/${finalCert.cert_number}?print=1`} target="_blank" rel="noreferrer"
                 className="flex items-center gap-3 rounded-2xl bg-gradient-to-l from-[var(--ic-dark,#3A2A1D)] to-[var(--ic-dark-3,#2A1D12)] p-3.5 text-white">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--ic-gold,#C9A24A)] text-black"><GraduationCap size={20} /></span>
                <div className="min-w-0 flex-1"><div className="truncate text-[13.5px] font-black">شهادة المستوى {finalCert.level}</div><div className="text-[11px] text-amber-100/75">{finalCert.percent}% · {fmtDay(finalCert.date)}</div></div>
                <Download size={16} className="text-amber-100/80" />
              </a>
            )}
            {certs.map(c => (
              <a key={c.serial} href={`/certificate/${c.serial}`} target="_blank" rel="noreferrer"
                 className="flex items-center gap-3 rounded-2xl bg-[#FBF8F3] p-3 ring-1 ring-[#ECE4D8] hover:ring-[#E2D0AE]">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800 ring-1 ring-amber-200"><Award size={18} /></span>
                <div className="min-w-0 flex-1"><div className="truncate text-[13px] font-extrabold text-[#1F1A16]">{c.title}</div><div className="text-[11px] text-[#A89B8C]">{c.course_title ? `${c.course_title} · ` : ''}{fmtDay(c.date)}</div></div>
                <Pill tone="ok">مكتسبة</Pill>
              </a>
            ))}
            {certCount === 0 && <Empty icon={Award} text="لا شهادات بعد" hint={coursePct != null ? `أكملت ${coursePct}% من ${course?.title} — الشهادة تقترب!` : undefined} />}
            {study?.streak && study.streak.current >= 3 && (
              <div className="flex items-center gap-3 rounded-2xl bg-rose-50/60 p-3 ring-1 ring-rose-100">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-rose-600"><Flame size={18} /></span>
                <div className="text-[13px] font-extrabold text-[#1F1A16]">{study.streak.current} أيام متتالية من الدراسة <span className="text-[11px] font-semibold text-[#A89B8C]">· أطول سلسلة {study.streak.longest}</span></div>
              </div>
            )}
          </div>
        </Panel>
      </div>

      {/* 5 — family overview + goals & notes */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <Panel className="p-5 lg:col-span-3">
          <PanelHead icon={Users} title="نظرة للأسرة" sub="ملخص واضح لولي الأمر" action={
            <button type="button" onClick={copySummary} className="inline-flex items-center gap-1.5 rounded-xl bg-[#FBF8F3] px-3 py-1.5 text-[12px] font-bold text-[#5A3E28] ring-1 ring-[#E2D8C8]">
              {copied ? <Check size={13} /> : <ClipboardCopy size={13} />} {copied ? 'تم النسخ' : 'نسخ'}
            </button>} />
          <div className="rounded-2xl bg-gradient-to-br from-[#FBF8F3] to-[var(--ic-gold-soft,#F6EBD3)] p-4 ring-1 ring-[#ECE4D8]">
            <p className="text-[14px] leading-relaxed text-[#3A2A1D]">
              <b>{first}</b> يتعلّم على مسار <b>{tracks.label}</b>{currentLevel ? <> في المستوى <b dir="ltr">{currentLevel}</b></> : null}.
              {coursePct != null && <> أنجز <b>{coursePct}%</b> من دورته الحالية.</>}
              {att?.rate != null && <> نسبة حضوره <b>{att.rate}%</b>.</>}
              {' '}{status.tone === 'good' ? 'مواظب ومتحمّس هذا الأسبوع 🌟' : status.tone === 'mid' ? 'نشِط هذا الأسبوع — تشجيع بسيط يزيده انتظامًا.' : 'لم يدرس هذا الأسبوع — تذكير لطيف يساعده على العودة.'}
            </p>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="rounded-xl bg-white p-3 ring-1 ring-[#ECE4D8]">
              <div className="text-[11px] font-bold text-[#A89B8C]">الحصة القادمة</div>
              <div className="mt-0.5 truncate text-[13px] font-extrabold text-[#1F1A16]">{upcoming[0] ? upcoming[0].title : '—'}</div>
              {upcoming[0] && <div className="text-[11.5px] text-[#7A6E62]">{fmtDay(upcoming[0].starts_at)} · {fmtHour(upcoming[0].starts_at)}</div>}
            </div>
            <div className="rounded-xl bg-white p-3 ring-1 ring-[#ECE4D8]">
              <div className="text-[11px] font-bold text-[#A89B8C]">تذكير الدفع</div>
              <div className="mt-0.5 text-[13px] font-extrabold text-[#1F1A16]">{pay ? PAY[pay.status].label : '—'}</div>
              {pay?.next_due_at && <div className="text-[11.5px] text-[#7A6E62]">القادمة {fmtDay(pay.next_due_at)}{pay.outstanding ? ` · ${mad(pay.outstanding)}` : ''}</div>}
            </div>
          </div>
          <button type="button" onClick={shareWa} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3 text-[13.5px] font-black text-white">
            <MessageCircle size={17} /> أرسل الملخص للأسرة عبر واتساب
          </button>
        </Panel>

        <Panel className="p-5 lg:col-span-2">
          <PanelHead icon={Target} title="أهدافي وملاحظات الفريق" />
          <div className="space-y-2.5">
            {notes.nextTask && (
              <div className="rounded-xl bg-amber-50 p-3 ring-1 ring-amber-200">
                <div className="flex items-center gap-1.5 text-[11.5px] font-black text-amber-900"><Target size={13} /> هدفي القادم</div>
                <p className="mt-1 text-[12.5px] leading-relaxed text-[#3A2A1D]">{notes.nextTask}</p>
              </div>
            )}
            {level.next && (
              <div className="rounded-xl bg-[#FBF8F3] p-3 ring-1 ring-[#ECE4D8]">
                <div className="text-[11.5px] font-black text-[#5A3E28]">هدف المستوى</div>
                <p className="mt-1 text-[12.5px] text-[#3A2A1D]">الوصول إلى <b dir="ltr">{level.next}</b>{currentLevel ? <> انطلاقًا من <b dir="ltr">{currentLevel}</b></> : null}</p>
              </div>
            )}
            {notes.adminMessage && (
              <div className="rounded-xl bg-white p-3 ring-1 ring-[#ECE4D8]">
                <div className="flex items-center gap-1.5 text-[11.5px] font-black text-[#5A3E28]"><KeyRound size={13} /> رسالة من الفريق</div>
                <p className="mt-1 whitespace-pre-line text-[12.5px] leading-relaxed text-[#3A2A1D]">{notes.adminMessage}</p>
              </div>
            )}
            {notes.examNotes.slice(0, 2).map((n, i) => (
              <div key={i} className="rounded-xl bg-white p-3 ring-1 ring-[#ECE4D8]">
                <div className="truncate text-[11.5px] font-black text-[#5A3E28]">ملاحظة الأستاذ · {n.title}</div>
                <p className="mt-1 text-[12.5px] leading-relaxed text-[#3A2A1D]">{n.note}</p>
              </div>
            ))}
            {!notes.nextTask && !level.next && !notes.adminMessage && notes.examNotes.length === 0 && (
              <Empty icon={Target} text="لا ملاحظات بعد" hint="أهدافك وملاحظات أساتذتك تظهر هنا." />
            )}
          </div>
        </Panel>
      </div>

      {/* 6 — recent activity */}
      <Panel className="p-5">
        <PanelHead icon={Activity} title="آخر النشاطات" sub={study?.last_active_at ? `آخر نشاط ${fmtDay(study.last_active_at)}` : undefined} />
        {feed.length === 0 ? <Empty icon={Activity} text="لا نشاط بعد" hint="ابدأ أول درس من «دوراتي»." /> : (
          <ol className="relative space-y-3 before:absolute before:bottom-2 before:right-[17px] before:top-2 before:w-px before:bg-[#ECE4D8]">
            {feed.map((e, i) => {
              const ev = EVENT[e.kind] ?? { ar: e.kind, icon: Activity, tone: 'bg-stone-100 text-stone-700' }
              return (
                <li key={i} className="relative flex gap-3">
                  <span className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${ev.tone}`}><ev.icon size={15} /></span>
                  <div className="min-w-0 pt-0.5">
                    <div className="text-[13px] font-extrabold text-[#1F1A16]">{ev.ar}</div>
                    {e.sub && <div className="truncate text-[12px] text-[#7A6E62]">{e.sub}</div>}
                    <div className="text-[11px] text-[#A89B8C]">{fmtDay(e.at)} · {fmtHour(e.at)}</div>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </Panel>
    </div>
  )
}
