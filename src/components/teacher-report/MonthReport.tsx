'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Download, Loader2, Save } from 'lucide-react'
import {
  computePay, evaluate, fetchMonthReport, monthLabel, saveMonthNote, shiftMonth,
  type MonthReport,
} from '@/lib/teacher-report'

/**
 * The teacher's monthly report (060) — one A4 document, downloaded as a PDF in
 * one click. Used in the teacher space (their own month) and on the CRM
 * teachers page (any teacher; staff also write the academy note there).
 *
 * The document uses fixed hex colours, not theme classes: the CRM restyles
 * zinc/gray, and the PDF must look the same wherever it is made. The PDF is
 * drawn from this page (html2pdf), so Arabic comes out exactly as on screen.
 */

const C = { navy: '#1E3A8A', blue: '#2563EB', gold: '#F59E0B', ink: '#0F172A', mute: '#64748B', line: '#E2E8F0', soft: '#F8FAFC' }
const mad = (n: number) => `${Math.round(n).toLocaleString('en-US')} د.م`
const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)}%` : '—')
const day = (iso: string) => new Date(iso).toLocaleDateString('ar-MA', { day: 'numeric', month: 'long' })
const GRADE_COLOR: Record<string, string> = { A: '#059669', B: '#2563EB', C: '#D97706', D: '#DC2626' }

export default function MonthReportView({ teacherId, initialMonth, staff = false, onMonth, demo }: {
  teacherId: string
  /** Demo / preview: show this report instead of loading one. */
  demo?: MonthReport
  initialMonth: string
  /** Staff see the academy-note editor. */
  staff?: boolean
  onMonth?: (month: string) => void
}) {
  const [month, setMonth] = useState(initialMonth)
  const [report, setReport] = useState<MonthReport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [pdfBusy, setPdfBusy] = useState(false)
  const [note, setNote] = useState('')
  const [noteBusy, setNoteBusy] = useState(false)
  const [noteSaved, setNoteSaved] = useState(false)
  const doc = useRef<HTMLDivElement>(null)

  const load = useCallback(async (m: string) => {
    setLoading(true); setError(null)
    if (demo) { setReport({ ...demo, month: m }); setLoading(false); return }
    try { const r = await fetchMonthReport(teacherId, m); setReport(r); setNote(r.academy_note?.note ?? '') }
    catch (e: any) { setError(e?.message ?? 'تعذّر تحميل التقرير.'); setReport(null) }
    finally { setLoading(false) }
  }, [teacherId, demo])
  useEffect(() => { load(month) }, [load, month])

  function go(by: number) { const m = shiftMonth(month, by); setMonth(m); onMonth?.(m) }

  const evalr = useMemo(() => (report ? evaluate(report) : null), [report])
  const pay = useMemo(() => (report ? computePay(report) : null), [report])

  async function downloadPdf() {
    if (!doc.current || !report) return
    setPdfBusy(true)
    try {
      const html2pdf = (await import('html2pdf.js')).default
      await html2pdf().set({
        margin: [8, 8, 10, 8],
        filename: `تقرير-${report.teacher.name}-${month.slice(0, 7)}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'], avoid: ['.avoid-break', 'tr'] },
      }).from(doc.current).save()
    } finally { setPdfBusy(false) }
  }

  async function saveNote() {
    if (demo) return
    setNoteBusy(true); setNoteSaved(false)
    try { await saveMonthNote(teacherId, month, note); setNoteSaved(true); await load(month) }
    catch (e: any) { setError(e?.message ?? 'تعذّر حفظ الملاحظة.') }
    finally { setNoteBusy(false) }
  }

  const thisMonth = new Date().toISOString().slice(0, 7)
  const isCurrent = month.slice(0, 7) === thisMonth

  return (
    <div dir="rtl" className="space-y-4">
      {/* ── toolbar (not part of the PDF) ── */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white border border-slate-200 p-3 shadow-sm">
        <button onClick={() => go(-1)} aria-label="الشهر السابق" className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:border-blue-300"><ChevronRight size={18} /></button>
        <div className="text-center min-w-[9rem]">
          <div className="text-[11px] font-bold text-slate-400">التقرير الشهري</div>
          <div className="text-[16px] font-extrabold" style={{ color: C.navy }}>{monthLabel(month)}</div>
        </div>
        <button onClick={() => go(1)} disabled={isCurrent} aria-label="الشهر التالي" className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:border-blue-300 disabled:opacity-30"><ChevronLeft size={18} /></button>
        <div className="flex-1" />
        <button onClick={downloadPdf} disabled={!report || pdfBusy}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-bold text-[#1E3A8A] ring-1 ring-amber-300 shadow-md disabled:opacity-50"
          style={{ background: 'linear-gradient(to left, #FBBF24, #EAB308)' }}>
          {pdfBusy ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} تحميل PDF
        </button>
      </div>

      {staff && report && (
        <div className="rounded-2xl bg-white border border-slate-200 p-3.5 shadow-sm space-y-2">
          <div className="text-[13px] font-extrabold" style={{ color: C.navy }}>ملاحظة الأكاديمية لهذا الشهر <span className="font-semibold text-slate-400">(تظهر للأستاذ في التقرير)</span></div>
          <textarea value={note} onChange={e => { setNote(e.target.value); setNoteSaved(false) }} rows={3} maxLength={2000}
            placeholder="مثال: شهر جيد — المطلوب الشهر القادم كتابة تقرير كل حصة في نفس اليوم."
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button onClick={saveNote} disabled={noteBusy}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-[12.5px] font-bold disabled:opacity-50" style={{ background: C.navy }}>
            {noteBusy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {noteSaved ? 'حُفظت' : 'حفظ الملاحظة'}
          </button>
        </div>
      )}

      {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-[13px] font-bold text-red-700">{error}</div>}
      {loading && !report && <div className="py-24 flex justify-center text-slate-400"><Loader2 className="animate-spin" /></div>}

      {/* ── the document ── */}
      {report && evalr && pay && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-100 p-2 sm:p-4">
          <div ref={doc} dir="rtl" className="mx-auto bg-white text-right" style={{ width: 760, color: C.ink, fontFamily: 'Tajawal, sans-serif', padding: 28 }}>
            <Header report={report} score={evalr.score} grade={evalr.grade} gradeLabel={evalr.gradeLabel} isCurrent={isCurrent} />
            <Kpis report={report} />
            <Money report={report} pay={pay} />
            <Evaluation e={evalr} />
            <Students report={report} />
            <Sessions report={report} />
            <Feedback report={report} />
            <div style={{ marginTop: 18, paddingTop: 10, borderTop: `1px solid ${C.line}`, fontSize: 10.5, color: C.mute, display: 'flex', justifyContent: 'space-between' }}>
              <span>مبني على بيانات الـCRM حتى {new Date(report.generated_at).toLocaleString('ar-MA', { dateStyle: 'medium', timeStyle: 'short' })}</span>
              <span>إنجليزي.كوم</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── document parts ─────────────────────────────────────── */

function H2({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, margin: '20px 0 8px', paddingBottom: 6, borderBottom: `2px solid ${C.gold}` }}>{children}</div>
}

function Header({ report, score, grade, gradeLabel, isCurrent }: { report: MonthReport; score: number; grade: string; gradeLabel: string; isCurrent: boolean }) {
  return (
    <div className="avoid-break" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 18, borderRadius: 16, color: '#fff', background: `linear-gradient(120deg, ${C.navy}, ${C.blue})` }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, opacity: 0.8, fontWeight: 700 }}>إنجليزي.كوم · التقرير الشهري للأستاذ</div>
        <div style={{ fontSize: 24, fontWeight: 900, marginTop: 4 }}>{report.teacher.name}</div>
        <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2, color: '#FDE68A' }}>
          {monthLabel(report.month)}{isCurrent ? ' — الشهر جارٍ، الأرقام حتى اليوم' : ''}
        </div>
      </div>
      <div style={{ textAlign: 'center', background: '#fff', color: C.ink, borderRadius: 14, padding: '10px 16px', minWidth: 110 }}>
        {/* explicit line heights: html2canvas draws a 1.0 line-height number over the line below */}
        <div style={{ fontSize: 34, fontWeight: 900, color: GRADE_COLOR[grade], lineHeight: '44px', height: 44 }}>{score}</div>
        <div style={{ fontSize: 10.5, color: C.mute, fontWeight: 700, lineHeight: '16px' }}>من 100</div>
        <div style={{ marginTop: 4, fontSize: 12.5, fontWeight: 800, color: GRADE_COLOR[grade] }}>{grade} · {gradeLabel}</div>
      </div>
    </div>
  )
}

function Box({ label, value, tone }: { label: string; value: React.ReactNode; tone?: string }) {
  return (
    <div style={{ background: C.soft, border: `1px solid ${C.line}`, borderRadius: 10, padding: '8px 10px', textAlign: 'center' }}>
      <div style={{ fontSize: 10.5, color: C.mute, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 900, color: tone ?? C.navy }}>{value}</div>
    </div>
  )
}

function Kpis({ report: r }: { report: MonthReport }) {
  const came = r.attendance.present + r.attendance.late
  return (
    <>
      <H2>الأرقام الأساسية</H2>
      <div className="avoid-break" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        <Box label="الطلاب" value={r.students.total} />
        <Box label="طلاب جدد" value={r.students.new} tone="#059669" />
        <Box label="غادروا" value={r.students.left} tone={r.students.left ? '#DC2626' : C.navy} />
        <Box label="جماعي / فردي" value={`${r.students.group} / ${r.students.private}`} />
        <Box label="حصص منجزة" value={r.sessions.done} />
        <Box label="الساعات" value={r.sessions.hours} />
        <Box label="حصص ملغاة" value={r.sessions.cancelled} tone={r.sessions.cancelled ? '#DC2626' : C.navy} />
        <Box label="تقارير ناقصة" value={r.sessions.missing_reports} tone={r.sessions.missing_reports ? '#DC2626' : '#059669'} />
        <Box label="نسبة الحضور" value={pct(came, r.attendance.marked)} />
        <Box label="حاضر · متأخر" value={`${r.attendance.present} · ${r.attendance.late}`} />
        <Box label="غائب · معذور" value={`${r.attendance.absent} · ${r.attendance.excused}`} tone={r.attendance.absent ? '#DC2626' : C.navy} />
        <Box label="تقييم الطلاب (الكل)" value={r.teacher.rating_count ? `${Number(r.teacher.rating_avg ?? 0).toFixed(1)} ★` : '—'} tone={C.gold} />
      </div>
    </>
  )
}

function Row({ k, v, strong, tone }: { k: string; v: string; strong?: boolean; tone?: string }) {
  return (
    <tr>
      <td style={{ padding: '7px 10px', borderBottom: `1px solid ${C.line}`, color: C.mute, fontSize: 12.5 }}>{k}</td>
      <td style={{ padding: '7px 10px', borderBottom: `1px solid ${C.line}`, fontWeight: strong ? 900 : 700, fontSize: strong ? 15 : 13, color: tone ?? C.ink, textAlign: 'left' }}>{v}</td>
    </tr>
  )
}

function Money({ report: r, pay }: { report: MonthReport; pay: ReturnType<typeof computePay> }) {
  const status = pay.status === 'paid' ? 'مدفوع' : pay.status === 'pending' ? 'مسجَّل — بانتظار الصرف' : 'تقديري — لم يُسجَّل بعد في الرواتب'
  return (
    <>
      <H2>المداخيل والأجر</H2>
      <table className="avoid-break" style={{ width: '100%', borderCollapse: 'collapse', border: `1px solid ${C.line}`, borderRadius: 10 }}>
        <tbody>
          <Row k="مداخيل مؤكَّدة من الطلاب الذين جئت بهم" v={mad(pay.revenue)} />
          {pay.model === 'revenue_share' ? (
            <>
              <Row k="نسبتك" v={pay.sharePct != null ? `${pay.sharePct}%` : 'غير محددة'} />
              <Row k="نصيبك" v={mad(pay.teacherShare)} />
              <Row k="نصيب الأكاديمية" v={mad(pay.academyShare)} />
            </>
          ) : (
            <Row k={`الساعات × سعر الساعة (${r.teacher.hourly_rate_mad ?? '—'} د.م)`} v={mad(pay.teacherShare)} />
          )}
          {pay.bonus > 0 && <Row k="مكافأة" v={`+ ${mad(pay.bonus)}`} tone="#059669" />}
          {pay.deduction > 0 && <Row k="خصم" v={`− ${mad(pay.deduction)}`} tone="#DC2626" />}
          <Row k="الأجر الصافي" v={mad(pay.net)} strong tone={C.navy} />
          <Row k="الحالة" v={status} tone={pay.status === 'paid' ? '#059669' : pay.status === 'pending' ? '#D97706' : C.mute} />
          {r.money.pending_brought > 0 && <Row k="دفعات بانتظار تأكيد الإدارة (لا تُحتسب بعد)" v={mad(r.money.pending_brought)} tone="#D97706" />}
          {r.money.paid_by_academy_students > 0 && <Row k="دفعات طلاب الأكاديمية الذين تُدرّسهم (لا تدخل في نسبتك)" v={mad(r.money.paid_by_academy_students)} tone={C.mute} />}
        </tbody>
      </table>
      {r.money.payout?.note && <div style={{ fontSize: 11.5, color: C.mute, marginTop: 6 }}>ملاحظة الرواتب: {r.money.payout.note}</div>}
    </>
  )
}

function Evaluation({ e }: { e: ReturnType<typeof evaluate> }) {
  const list = (title: string, items: string[], color: string, bg: string) => items.length > 0 && (
    <div className="avoid-break" style={{ background: bg, borderRadius: 10, padding: '10px 12px', marginTop: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color, marginBottom: 4 }}>{title}</div>
      {items.map((t, i) => <div key={i} style={{ fontSize: 12.5, lineHeight: 1.7 }}>• {t}</div>)}
    </div>
  )
  return (
    <>
      <H2>التقييم الآلي — مبني فقط على بيانات الشهر</H2>
      <div className="avoid-break" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px 18px' }}>
        {e.criteria.map(c => (
          <div key={c.key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ fontWeight: 700 }}>{c.label} <span style={{ color: C.mute, fontWeight: 600 }}>· {c.detail}</span></span>
              <span style={{ fontWeight: 800 }}>{c.score}/{c.max}</span>
            </div>
            <div style={{ height: 7, background: C.line, borderRadius: 99, overflow: 'hidden', marginTop: 3 }}>
              <div style={{ height: '100%', width: `${(c.score / c.max) * 100}%`, background: c.score / c.max >= 0.75 ? '#059669' : c.score / c.max >= 0.45 ? C.gold : '#DC2626' }} />
            </div>
          </div>
        ))}
      </div>
      {e.noActivity && list('ملاحظة', ['لا نشاط مسجَّل هذا الشهر — لا حصص ولا حضور.'], '#DC2626', '#FEF2F2')}
      {list('نقاط القوة', e.strengths, '#047857', '#ECFDF5')}
      {list('نقاط الضعف', e.weaknesses, '#B91C1C', '#FEF2F2')}
      {list('للشهر القادم', e.actions, C.navy, '#EFF6FF')}
    </>
  )
}

function Students({ report: r }: { report: MonthReport }) {
  const th: React.CSSProperties = { padding: '6px 8px', fontSize: 11, color: C.mute, fontWeight: 800, background: C.soft, borderBottom: `1px solid ${C.line}`, textAlign: 'right' }
  const td: React.CSSProperties = { padding: '6px 8px', fontSize: 12, borderBottom: `1px solid ${C.line}` }
  return (
    <>
      <H2>الطلاب ({r.students.total}) — {r.students.brought} جئت بهم · {r.students.academy_assigned} من الأكاديمية</H2>
      {r.students.list.length === 0 ? <div style={{ fontSize: 12.5, color: C.mute }}>لا طلاب هذا الشهر.</div> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', border: `1px solid ${C.line}` }}>
          <thead><tr>
            <th style={th}>الطالب</th><th style={th}>النوع</th><th style={th}>المصدر</th>
            <th style={th}>حاضر</th><th style={th}>متأخر</th><th style={th}>غائب</th><th style={th}>معذور</th>
            <th style={th}>الحضور</th><th style={th}>دفع هذا الشهر</th>
          </tr></thead>
          <tbody>
            {r.students.list.map(s => {
              const marked = s.present + s.late + s.absent + s.excused
              return (
                <tr key={s.id}>
                  <td style={{ ...td, fontWeight: 700 }}>
                    {s.name}
                    {s.is_new && <span style={{ color: '#059669', fontSize: 10.5, fontWeight: 800 }}> · جديد</span>}
                    {s.left && <span style={{ color: '#DC2626', fontSize: 10.5, fontWeight: 800 }}> · غادر</span>}
                    {s.review_status === 'pending' && <span style={{ color: '#D97706', fontSize: 10.5, fontWeight: 800 }}> · بانتظار المراجعة</span>}
                  </td>
                  <td style={td}>{s.kind === 'private' ? 'فردي' : 'جماعي'}</td>
                  <td style={td}>{s.brought ? 'أنت' : 'الأكاديمية'}</td>
                  <td style={td}>{s.present}</td><td style={td}>{s.late}</td>
                  <td style={{ ...td, color: s.absent >= 2 ? '#DC2626' : C.ink, fontWeight: s.absent >= 2 ? 800 : 400 }}>{s.absent}</td>
                  <td style={td}>{s.excused}</td>
                  <td style={td}>{pct(s.present + s.late, marked)}</td>
                  <td style={{ ...td, fontWeight: 700 }}>{s.paid > 0 ? mad(s.paid) : '—'}{s.pending > 0 ? <span style={{ color: '#D97706', fontSize: 10.5 }}> (+{mad(s.pending)} بانتظار)</span> : null}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </>
  )
}

function Sessions({ report: r }: { report: MonthReport }) {
  if (r.sessions.cancelled === 0 && r.sessions.missing_reports === 0) return null
  return (
    <>
      <H2>الحصص الملغاة والتقارير</H2>
      {r.sessions.cancel_reasons.length > 0 && (
        <div className="avoid-break" style={{ fontSize: 12.5, lineHeight: 1.8 }}>
          {r.sessions.cancel_reasons.map((c, i) => (
            <div key={i}>• {day(c.date)} — {c.title}: <span style={{ color: C.mute }}>{c.reason || 'بدون سبب مسجَّل'}</span></div>
          ))}
        </div>
      )}
      {r.sessions.missing_reports > 0 && (
        <div style={{ fontSize: 12.5, color: '#B91C1C', marginTop: 6 }}>• {r.sessions.missing_reports} حصة منجزة بدون تقرير.</div>
      )}
    </>
  )
}

function Feedback({ report: r }: { report: MonthReport }) {
  return (
    <>
      <H2>آراء الطلاب وملاحظة الأكاديمية</H2>
      {r.reviews.length === 0 ? (
        <div style={{ fontSize: 12.5, color: C.mute }}>لا تقييمات من الطلاب هذا الشهر.</div>
      ) : r.reviews.map((v, i) => (
        <div key={i} className="avoid-break" style={{ borderBottom: `1px solid ${C.line}`, padding: '6px 0', fontSize: 12.5 }}>
          <span style={{ color: C.gold, fontWeight: 900 }}>{'★'.repeat(v.rating)}{'☆'.repeat(5 - v.rating)}</span>
          <span style={{ color: C.mute }}> · {day(v.date)}</span>
          {v.comment && <div style={{ marginTop: 2 }}>«{v.comment}»</div>}
        </div>
      ))}
      <div className="avoid-break" style={{ marginTop: 10, background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '10px 12px' }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#92400E', marginBottom: 4 }}>ملاحظة الأكاديمية</div>
        <div style={{ fontSize: 12.5, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{r.academy_note?.note || 'لا ملاحظة مكتوبة لهذا الشهر.'}</div>
      </div>
    </>
  )
}
