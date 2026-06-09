'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight, Phone, MessageCircle, Mail, MapPin, Loader2, GraduationCap,
  Wallet, Receipt, CreditCard, Printer, CheckCircle, XCircle, Plus,
  StickyNote, Activity, Edit3, Save, ChevronLeft, CalendarDays, BadgeCheck,
  Clock, BookOpen, FileText,
} from 'lucide-react'

import { useStaff } from '@/lib/staff-context'
import { type CrmStudent, type CrmPayment } from '@/lib/crm-types'
import {
  fetchStudentById, fetchCrmPayments, approveCrmPayment, declineCrmPayment,
  createCrmPayment, patchStudent,
} from '@/lib/crm-db'
import {
  fetchReceiptsForStudent, printReceipt, buildReceiptWhatsAppMessage,
  ensurePaymentReceipt, type CrmReceipt,
} from '@/lib/crm-receipts'
import { whatsappLink } from '@/lib/leads-db'
import Avatar from '@/app/sales/_components/Avatar'

const MAD = (n: number) => new Intl.NumberFormat('en-US').format(Math.round(n))
const fmtDate = (s?: string | null) =>
  s ? new Date(s).toLocaleDateString('ar-MA', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'

const PAY_STATUS_AR: Record<string, { text: string; cls: string }> = {
  pending:  { text: 'معلق',   cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
  paid:     { text: 'مدفوع',  cls: 'bg-green-50 text-green-700 border border-green-200' },
  declined: { text: 'مرفوض', cls: 'bg-red-50 text-red-700 border border-red-200' },
}
const PAYMENT_TYPE_AR: Record<string, string> = {
  course_one_time: 'دورة (مرة واحدة)', private_monthly: 'شهري (خاص)',
}

type Tab = 'overview' | 'payments' | 'notes' | 'activity'
const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'نظرة عامة' },
  { id: 'payments', label: 'المدفوعات والفواتير' },
  { id: 'notes',    label: 'الملاحظات' },
  { id: 'activity', label: 'النشاط داخل المنصة' },
]

export default function StudentProfilePage() {
  const params  = useParams()
  const router  = useRouter()
  const staff   = useStaff()
  const id      = String(params?.id ?? '')

  const [student,  setStudent]  = useState<CrmStudent | null>(null)
  const [payments, setPayments] = useState<CrmPayment[]>([])
  const [receipts, setReceipts] = useState<CrmReceipt[]>([])
  const [loading,  setLoading]  = useState(true)
  const [tab,      setTab]      = useState<Tab>('overview')
  const [payBusy,  setPayBusy]  = useState<string | null>(null)

  // notes
  const [editNote, setEditNote] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [savingNote, setSavingNote] = useState(false)

  // add payment
  const [showPayForm, setShowPayForm] = useState(false)
  const [payAmt,    setPayAmt]    = useState('')
  const [payType,   setPayType]   = useState<'course_one_time' | 'private_monthly'>('private_monthly')
  const [payNotes,  setPayNotes]  = useState('')
  const [savingPay, setSavingPay] = useState(false)

  useEffect(() => { if (id) load() }, [id])

  async function load() {
    setLoading(true)
    const s = await fetchStudentById(id)
    if (!s) { setLoading(false); return }
    const [p, r] = await Promise.all([
      fetchCrmPayments({ studentId: id }),
      fetchReceiptsForStudent(id),
    ])
    setStudent(s); setPayments(p); setReceipts(r); setNoteText(s.notes ?? '')
    setLoading(false)
  }

  async function reloadPay() {
    const [p, r] = await Promise.all([fetchCrmPayments({ studentId: id }), fetchReceiptsForStudent(id)])
    setPayments(p); setReceipts(r)
  }

  async function saveNote() {
    if (!student) return
    setSavingNote(true)
    await patchStudent(student.id, { notes: noteText } as any)
    setSavingNote(false); setEditNote(false)
    setStudent({ ...student, notes: noteText })
  }

  async function addPayment() {
    if (!student || !payAmt) return
    setSavingPay(true)
    await createCrmPayment({
      studentId: student.id, type: payType,
      courseOrService: student.course ?? undefined,
      amountMad: parseFloat(payAmt), notes: payNotes || undefined,
    })
    setPayAmt(''); setPayNotes(''); setShowPayForm(false)
    await reloadPay(); setSavingPay(false)
  }
  async function approve(pid: string) { setPayBusy(pid); await approveCrmPayment(pid, staff.id); await reloadPay(); setPayBusy(null) }
  async function decline(pid: string) { setPayBusy(pid); await declineCrmPayment(pid); await reloadPay(); setPayBusy(null) }

  /** Ensure a receipt exists for this paid payment, then return it. */
  async function getReceipt(p: CrmPayment): Promise<CrmReceipt | null> {
    const found = receipts.find(r => r.payment_id === p.id)
    if (found) return found
    if (!student) return null
    const r = await ensurePaymentReceipt({
      paymentId: p.id, studentId: student.id, leadId: student.lead_id,
      fullName: student.full_name, phoneNumber: student.phone_number, courseName: student.course,
      paymentType: p.payment_type, amountMad: Number(p.amount_mad),
      paymentDate: p.payment_date, notes: p.notes, issuedById: staff.id,
    })
    if (r) setReceipts(prev => [r, ...prev])
    return r
  }
  async function downloadReceipt(p: CrmPayment) { const r = await getReceipt(p); if (r) printReceipt(r) }
  async function sendReceipt(p: CrmPayment) {
    const r = await getReceipt(p)
    if (r && phone) window.open(`https://wa.me/${phone.replace(/\D/g,'')}?text=${buildReceiptWhatsAppMessage(r)}`, '_blank')
  }

  if (loading) {
    return <div className="py-32 flex items-center justify-center text-zinc-300"><Loader2 size={28} className="animate-spin" /></div>
  }
  if (!student) {
    return (
      <div className="p-6 text-center">
        <p className="text-zinc-500 mb-3">لم يُعثر على الطالب</p>
        <Link href="/sales/workspace?tab=students" className="text-blue-600 font-semibold text-sm">← العودة إلى الطلاب</Link>
      </div>
    )
  }

  const phone   = student.phone_number ?? ''
  const paid    = payments.filter(p => p.payment_status === 'paid')
  const pending = payments.filter(p => p.payment_status === 'pending')
  const totalPaid    = paid.reduce((s, p) => s + Number(p.amount_mad), 0) || (student.total_paid_mad ?? 0)
  const outstanding  = pending.reduce((s, p) => s + Number(p.amount_mad), 0)
  const lastPaid     = paid[0]

  const statusBadge = student.payment_status === 'paid'
    ? 'bg-green-50 text-green-700 border-green-200'
    : student.payment_status === 'overdue' ? 'bg-red-50 text-red-600 border-red-200'
    : 'bg-amber-50 text-amber-700 border-amber-200'
  const statusText = student.payment_status === 'paid' ? 'مدفوع بالكامل' : student.payment_status === 'overdue' ? 'متأخر' : 'معلق'

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* Back */}
      <Link href="/sales/workspace?tab=students" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-zinc-500 hover:text-zinc-800">
        <ArrowRight size={15} /> العودة إلى قائمة الطلاب
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">

        {/* ── Left column ─────────────────────────────── */}
        <div className="space-y-4">
          {/* Quick info card */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${student.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-zinc-100 text-zinc-500 border-zinc-200'}`}>
                ● {student.is_active ? 'نشط' : 'غير نشط'}
              </span>
            </div>
            <dl className="space-y-3">
              <InfoLine icon={CalendarDays} label="تاريخ التسجيل" value={fmtDate(student.enrollment_date)} />
              <InfoLine icon={BookOpen}     label="المستوى / الدورة" value={student.course?.toUpperCase() ?? '—'} />
              <InfoLine icon={GraduationCap} label="نوع الطالب" value={student.student_type === 'course_student' ? 'دورة جماعية' : 'دروس خاصة'} />
              {student.monthly_fee_mad && <InfoLine icon={Wallet} label="الرسوم الشهرية" value={`${MAD(student.monthly_fee_mad)} د.م`} />}
              {student.next_payment_date && <InfoLine icon={Clock} label="الدفع القادم" value={fmtDate(student.next_payment_date)} />}
            </dl>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 space-y-2">
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1 px-1">إجراءات سريعة</div>
            {phone && (
              <>
                <a href={`tel:${phone}`} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-[13px] font-semibold text-zinc-700">
                  <Phone size={15} className="text-zinc-400" /> اتصال
                </a>
                <a href={whatsappLink(phone, `مرحبًا ${student.full_name}،`) ?? '#'} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-green-50 hover:bg-green-100 text-[13px] font-semibold text-green-700">
                  <MessageCircle size={15} /> واتساب
                </a>
              </>
            )}
            <button onClick={() => { setTab('payments'); setShowPayForm(true) }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-[13px] font-semibold text-zinc-700">
              <Receipt size={15} className="text-zinc-400" /> فاتورة جديدة
            </button>
          </div>
        </div>

        {/* ── Main column ─────────────────────────────── */}
        <div className="space-y-4 min-w-0">

          {/* Header card */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-5">
            <div className="flex items-start gap-4">
              <Avatar name={student.full_name} size={64} square />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-[20px] font-black text-zinc-900">{student.full_name}</h2>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${student.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-zinc-100 text-zinc-500 border-zinc-200'}`}>
                    {student.is_active ? 'نشط' : 'غير نشط'}
                  </span>
                </div>
                <p className="text-[13px] text-zinc-500 mt-0.5">
                  طالب في {student.student_type === 'private_student' ? 'دروس خاصة' : `دورة ${student.course?.toUpperCase() ?? ''}`}
                </p>
                <div className="flex items-center gap-4 mt-2 text-[13px] text-zinc-500 flex-wrap">
                  {phone && <span className="inline-flex items-center gap-1" dir="ltr"><Phone size={13} /> {phone}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <StatCard label="إجمالي المدفوع" value={`${MAD(totalPaid)}`} unit="د.م" tone="text-emerald-700" />
            <StatCard label="المتبقي" value={outstanding > 0 ? MAD(outstanding) : '0'} unit="د.م" tone="text-zinc-900" />
            <StatCard label="إجمالي الفواتير" value={receipts.length} tone="text-zinc-900" />
            <StatCard label="آخر دفعة" value={lastPaid ? MAD(Number(lastPaid.amount_mad)) : '—'} unit={lastPaid ? 'د.م' : ''} sub={lastPaid ? fmtDate(lastPaid.payment_date) : ''} tone="text-zinc-900" />
            <div className={`rounded-2xl border p-4 flex flex-col justify-center ${statusBadge}`}>
              <div className="text-[11px] opacity-70 mb-1">حالة الدفع</div>
              <div className="text-[14px] font-black flex items-center gap-1"><BadgeCheck size={15} /> {statusText}</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-zinc-200/80">
            <div className="flex overflow-x-auto border-b border-zinc-100">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={[
                    'px-4 py-3.5 text-[13px] font-semibold whitespace-nowrap border-b-2 transition-colors flex-shrink-0',
                    tab === t.id ? 'border-yellow-400 text-zinc-900' : 'border-transparent text-zinc-400 hover:text-zinc-600',
                  ].join(' ')}>
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {/* OVERVIEW */}
              {tab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Panel title="الدورة الحالية">
                    <Line label="المستوى" value={student.course?.toUpperCase() ?? '—'} />
                    <Line label="النوع" value={student.student_type === 'private_student' ? 'دروس خاصة' : 'دورة جماعية'} />
                    <Line label="تاريخ التسجيل" value={fmtDate(student.enrollment_date)} />
                    <Line label="الحالة" value={student.is_active ? 'نشط' : 'غير نشط'} />
                  </Panel>
                  <Panel title="الفواتير والمدفوعات الأخيرة">
                    {paid.length === 0 && pending.length === 0
                      ? <p className="text-[13px] text-zinc-400 py-3">لا توجد مدفوعات</p>
                      : [...pending, ...paid].slice(0, 4).map(p => {
                          const info = PAY_STATUS_AR[p.payment_status]
                          return (
                            <div key={p.id} className="flex items-center justify-between py-2 border-b border-zinc-50 last:border-none">
                              <div className="text-[13px]">
                                <div className="font-semibold text-zinc-800">{MAD(Number(p.amount_mad))} د.م</div>
                                <div className="text-[11px] text-zinc-400">{fmtDate(p.payment_date)}</div>
                              </div>
                              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${info.cls}`}>{info.text}</span>
                            </div>
                          )
                        })}
                  </Panel>
                  <Panel title="ملاحظات">
                    <p className="text-[13px] text-zinc-600 leading-relaxed whitespace-pre-wrap">
                      {student.notes || <span className="text-zinc-300 italic">لا توجد ملاحظات</span>}
                    </p>
                  </Panel>
                  <Panel title="النشاط داخل المنصة">
                    <div className="flex flex-col items-center justify-center py-4 text-center text-zinc-400">
                      <Activity size={22} className="mb-2 text-zinc-300" />
                      <p className="text-[12px]">تتبّع نشاط التعلّم سيظهر هنا<br />(دروس، امتحانات، وقت التعلّم)</p>
                    </div>
                  </Panel>
                </div>
              )}

              {/* PAYMENTS */}
              {tab === 'payments' && (
                <div className="space-y-3">
                  <button onClick={() => setShowPayForm(v => !v)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-zinc-200 text-zinc-500 hover:border-yellow-400 hover:text-yellow-600 font-semibold text-[13px]">
                    <Plus size={15} /> إضافة دفعة / فاتورة
                  </button>

                  {showPayForm && (
                    <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-zinc-500 font-semibold">المبلغ (د.م)</label>
                          <input type="number" value={payAmt} onChange={e => setPayAmt(e.target.value)} dir="ltr"
                            className="w-full mt-1 border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white" placeholder="0" />
                        </div>
                        <div>
                          <label className="text-[11px] text-zinc-500 font-semibold">النوع</label>
                          <select value={payType} onChange={e => setPayType(e.target.value as any)}
                            className="w-full mt-1 border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white">
                            <option value="private_monthly">شهري (خاص)</option>
                            <option value="course_one_time">دورة (مرة واحدة)</option>
                          </select>
                        </div>
                      </div>
                      <input value={payNotes} onChange={e => setPayNotes(e.target.value)} placeholder="ملاحظات (اختياري)"
                        className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white" />
                      <div className="flex gap-2">
                        <button onClick={addPayment} disabled={savingPay || !payAmt}
                          className="flex-1 py-2 bg-black text-white rounded-lg font-bold text-[13px] disabled:opacity-50">
                          {savingPay ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'تسجيل الدفعة'}
                        </button>
                        <button onClick={() => setShowPayForm(false)} className="px-4 py-2 border border-zinc-200 rounded-lg text-[13px] text-zinc-500">إلغاء</button>
                      </div>
                    </div>
                  )}

                  {payments.length === 0 && !showPayForm && <p className="text-center py-6 text-zinc-400 text-[14px]">لا توجد مدفوعات</p>}

                  {payments.map(p => {
                    const info = PAY_STATUS_AR[p.payment_status]
                    const receipt = receipts.find(r => r.payment_id === p.id)
                    return (
                      <div key={p.id} className="bg-white border border-zinc-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-bold text-[15px]">{MAD(Number(p.amount_mad))} د.م</div>
                            <div className="text-[12px] text-zinc-400">{PAYMENT_TYPE_AR[p.payment_type]} {p.payment_date && `· ${fmtDate(p.payment_date)}`}</div>
                          </div>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${info.cls}`}>{info.text}</span>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {p.payment_status === 'pending' && (
                            <>
                              <button onClick={() => approve(p.id)} disabled={!!payBusy}
                                className="flex items-center gap-1 text-[12px] font-bold px-3 py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50">
                                {payBusy === p.id ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle size={11} />} قبول
                              </button>
                              <button onClick={() => decline(p.id)} disabled={!!payBusy}
                                className="flex items-center gap-1 text-[12px] px-3 py-1.5 rounded-lg border border-red-200 text-red-500"><XCircle size={11} /> رفض</button>
                            </>
                          )}
                          {p.payment_status === 'paid' && (
                            <>
                              <button onClick={() => downloadReceipt(p)}
                                className="flex items-center gap-1 text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-black text-yellow-400 hover:bg-zinc-800"><Printer size={11} /> تحميل الوصل</button>
                              {phone && (
                                <button onClick={() => sendReceipt(p)}
                                  className="flex items-center gap-1 text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100"><MessageCircle size={11} /> إرسال الوصل</button>
                              )}
                              {receipt && <span className="text-[11px] text-zinc-400 self-center">{receipt.receipt_number}</span>}
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* NOTES */}
              {tab === 'notes' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-[14px]">ملاحظات الطالب</span>
                    <button onClick={() => setEditNote(v => !v)} className="flex items-center gap-1 text-[12px] text-zinc-400 hover:text-zinc-700">
                      <Edit3 size={12} /> {editNote ? 'إلغاء' : 'تعديل'}
                    </button>
                  </div>
                  {editNote ? (
                    <>
                      <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={8} placeholder="أضف ملاحظاتك..."
                        className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-[14px] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                      <button onClick={saveNote} disabled={savingNote}
                        className="mt-3 w-full py-2.5 bg-black text-white rounded-xl font-bold text-[13px] flex items-center justify-center gap-2">
                        {savingNote ? <Loader2 size={14} className="animate-spin" /> : <><Save size={14} /> حفظ</>}
                      </button>
                    </>
                  ) : (
                    <div className="bg-zinc-50 rounded-xl p-4 min-h-[120px] text-[14px] text-zinc-600 leading-relaxed whitespace-pre-wrap">
                      {noteText || <span className="text-zinc-300 italic">لا توجد ملاحظات</span>}
                    </div>
                  )}
                </div>
              )}

              {/* ACTIVITY */}
              {tab === 'activity' && (
                <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-400">
                  <Activity size={28} className="mb-3 text-zinc-300" />
                  <p className="text-[14px] font-medium text-zinc-500">تتبّع النشاط داخل المنصة</p>
                  <p className="text-[12px] mt-1 max-w-xs">سيظهر هنا نشاط الطالب على Inglizi.com: تسجيلات الدخول، مشاهدات الدروس، الامتحانات، ووقت التعلّم — بمجرد ربط حسابه.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Sub-components ─────────────────────────────────────── */
function InfoLine({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-[12px] text-zinc-400"><Icon size={14} className="text-zinc-300" /> {label}</span>
      <span className="text-[13px] font-semibold text-zinc-800">{value}</span>
    </div>
  )
}

function StatCard({ label, value, unit, sub, tone }: { label: string; value: string | number; unit?: string; sub?: string; tone: string }) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 p-4">
      <div className="text-[11px] text-zinc-400 mb-1">{label}</div>
      <div className={`text-[18px] font-black ${tone} flex items-baseline gap-1`}>
        {value}{unit && <span className="text-[12px] font-semibold text-zinc-400">{unit}</span>}
      </div>
      {sub && <div className="text-[10px] text-zinc-400 mt-0.5">{sub}</div>}
    </div>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-zinc-100 rounded-xl p-4">
      <h4 className="text-[13px] font-bold text-zinc-800 mb-3">{title}</h4>
      {children}
    </div>
  )
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-zinc-50 last:border-none">
      <span className="text-[12px] text-zinc-400">{label}</span>
      <span className="text-[13px] font-semibold text-zinc-800">{value}</span>
    </div>
  )
}
