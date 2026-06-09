'use client'

import { useEffect, useState } from 'react'
import {
  X, Phone, MessageCircle, GraduationCap, CreditCard,
  FileText, StickyNote, Printer, CheckCircle, XCircle,
  Loader2, Plus, Calendar, RotateCcw, Edit3, Save,
} from 'lucide-react'
import { type CrmStudent, type CrmPayment } from '@/lib/crm-types'
import {
  fetchCrmPayments, approveCrmPayment, declineCrmPayment, createCrmPayment, patchStudent,
} from '@/lib/crm-db'
import { fetchReceiptsForStudent, printReceipt, buildReceiptWhatsAppMessage, type CrmReceipt } from '@/lib/crm-receipts'
import { whatsappLink } from '@/lib/leads-db'
import { useStaff } from '@/lib/staff-context'

type Tab = 'info' | 'payments' | 'receipts' | 'notes'

const PAYMENT_TYPE_AR: Record<string, string> = {
  course_one_time: 'دورة (مرة واحدة)',
  private_monthly:  'شهري (خاص)',
}
const PAY_STATUS_AR: Record<string, { text: string; cls: string }> = {
  pending:  { text: 'معلق',   cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
  paid:     { text: 'مدفوع',  cls: 'bg-green-50 text-green-700 border border-green-200' },
  declined: { text: 'مرفوض', cls: 'bg-red-50 text-red-700 border border-red-200' },
}

function fmtDate(s?: string | null) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('ar-MA', { year: 'numeric', month: 'long', day: 'numeric' })
}

interface Props {
  student:   CrmStudent | null
  onClose:   () => void
  onUpdated: () => void
  isFounder: boolean
}

export default function StudentDrawer({ student, onClose, onUpdated, isFounder }: Props) {
  const staff = useStaff()
  const [tab,      setTab]      = useState<Tab>('info')
  const [payments, setPayments] = useState<CrmPayment[]>([])
  const [receipts, setReceipts] = useState<CrmReceipt[]>([])
  const [loading,  setLoading]  = useState(false)
  const [payBusy,  setPayBusy]  = useState<string | null>(null)

  // Edit notes
  const [editNote, setEditNote] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [savingNote, setSavingNote] = useState(false)

  // Add payment
  const [showPayForm, setShowPayForm] = useState(false)
  const [payAmt,      setPayAmt]      = useState('')
  const [payType,     setPayType]     = useState<'course_one_time' | 'private_monthly'>('private_monthly')
  const [payMethod,   setPayMethod]   = useState<'cash' | 'bank_transfer' | 'card' | 'other'>('cash')
  const [payNotes,    setPayNotes]    = useState('')
  const [savingPay,   setSavingPay]   = useState(false)

  useEffect(() => {
    if (!student) return
    setTab('info')
    setNoteText(student.notes ?? '')
    setLoading(true)
    Promise.all([
      fetchCrmPayments({ studentId: student.id }),
      fetchReceiptsForStudent(student.id),
    ]).then(([p, r]) => {
      setPayments(p)
      setReceipts(r)
      setLoading(false)
    })
  }, [student?.id])

  async function saveNote() {
    if (!student) return
    setSavingNote(true)
    await patchStudent(student.id, { notes: noteText } as any)
    setSavingNote(false)
    setEditNote(false)
    onUpdated()
  }

  async function addPayment() {
    if (!student || !payAmt) return
    setSavingPay(true)
    await createCrmPayment({
      studentId:       student.id,
      type:            payType,
      courseOrService: student.course ?? undefined,
      amountMad:       parseFloat(payAmt),
      notes:           payNotes || undefined,
    })
    setPayAmt(''); setPayNotes(''); setShowPayForm(false)
    const p = await fetchCrmPayments({ studentId: student.id })
    setPayments(p)
    setSavingPay(false)
    onUpdated()
  }

  async function approve(id: string) {
    setPayBusy(id)
    await approveCrmPayment(id, staff.id)
    const [p, r] = await Promise.all([
      fetchCrmPayments({ studentId: student!.id }),
      fetchReceiptsForStudent(student!.id),
    ])
    setPayments(p); setReceipts(r); setPayBusy(null)
    onUpdated()
  }

  async function decline(id: string) {
    setPayBusy(id)
    await declineCrmPayment(id)
    const p = await fetchCrmPayments({ studentId: student!.id })
    setPayments(p); setPayBusy(null)
  }

  if (!student) return null

  const phone = student.phone_number ?? ''

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer — slides from LEFT (content side in RTL) */}
      <aside
        className="fixed top-0 bottom-0 left-0 z-50 w-full sm:w-[480px] bg-white flex flex-col shadow-2xl"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-zinc-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <GraduationCap size={18} className="text-zinc-400" />
            <span className="font-bold text-[17px] text-zinc-900 truncate max-w-[260px]">{student.full_name}</span>
          </div>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-zinc-700 p-1">
            <X size={22} />
          </button>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-zinc-100 flex-shrink-0 flex-wrap">
          {phone && (
            <>
              <a href={`tel:${phone}`}
                className="flex items-center gap-1.5 text-[13px] font-semibold px-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-700 hover:bg-zinc-100">
                <Phone size={13} /> <span dir="ltr">{phone}</span>
              </a>
              <a href={whatsappLink(phone, `مرحبًا ${student.full_name}،`) ?? '#'} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[13px] font-bold px-3 py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600">
                <MessageCircle size={13} /> واتساب
              </a>
            </>
          )}
          <span className={[
            'text-[12px] font-bold px-3 py-1.5 rounded-lg border',
            student.payment_status === 'paid'    ? 'bg-green-50 text-green-700 border-green-200'
            : student.payment_status === 'overdue' ? 'bg-red-50 text-red-600 border-red-200'
            : 'bg-amber-50 text-amber-700 border-amber-200',
          ].join(' ')}>
            {student.payment_status === 'paid' ? '✓ مدفوع' : student.payment_status === 'overdue' ? 'متأخر' : 'معلق'}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-100 flex-shrink-0">
          {([
            { id: 'info',     label: 'المعلومات' },
            { id: 'payments', label: `المدفوعات (${payments.length})` },
            { id: 'receipts', label: `الوصولات (${receipts.length})` },
            { id: 'notes',    label: 'الملاحظات' },
          ] as { id: Tab; label: string }[]).map(t => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)}
              className={[
                'flex-1 py-3 text-[13px] font-semibold transition-colors border-b-2',
                tab === t.id ? 'border-yellow-400 text-zinc-900' : 'border-transparent text-zinc-400 hover:text-zinc-600',
              ].join(' ')}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-zinc-300" />
            </div>
          )}

          {/* ── INFO ── */}
          {!loading && tab === 'info' && (
            <div className="p-5 space-y-4">
              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100">
                  <div className="text-[11px] text-zinc-400 font-medium mb-1">إجمالي المدفوع</div>
                  <div className="text-[20px] font-black text-zinc-900">
                    {(student.total_paid_mad ?? 0).toLocaleString('ar-MA')}
                    <span className="text-[13px] font-normal text-zinc-400 mr-1">درهم</span>
                  </div>
                </div>
                {student.monthly_fee_mad && (
                  <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <div className="text-[11px] text-blue-400 font-medium mb-1">الرسوم الشهرية</div>
                    <div className="text-[20px] font-black text-blue-700">
                      {student.monthly_fee_mad.toLocaleString('ar-MA')}
                      <span className="text-[13px] font-normal text-blue-400 mr-1">/ شهر</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="space-y-1.5">
                <Row label="نوع الطالب" value={student.student_type === 'course_student' ? 'دورة جماعية' : 'دروس خاصة'} />
                <Row label="الدورة" value={student.course?.toUpperCase() ?? '—'} />
                <Row label="تاريخ التسجيل" value={fmtDate(student.enrollment_date)} />
                {student.next_payment_date && (
                  <Row
                    label="الدفع القادم"
                    value={fmtDate(student.next_payment_date)}
                    highlight={(new Date(student.next_payment_date).getTime() - Date.now()) / 86400000 <= 7}
                  />
                )}
              </div>
            </div>
          )}

          {/* ── PAYMENTS ── */}
          {!loading && tab === 'payments' && (
            <div className="p-5 space-y-3">
              {/* Add payment */}
              <button type="button" onClick={() => setShowPayForm(v => !v)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-zinc-200 text-zinc-500 hover:border-yellow-400 hover:text-yellow-600 font-semibold text-[13px] transition-colors">
                <Plus size={14} /> إضافة دفعة
              </button>

              {showPayForm && (
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-zinc-500 font-semibold">المبلغ (درهم)</label>
                      <input type="number" value={payAmt} onChange={e => setPayAmt(e.target.value)}
                        placeholder="0" dir="ltr"
                        className="w-full mt-1 border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                    </div>
                    <div>
                      <label className="text-[11px] text-zinc-500 font-semibold">طريقة الدفع</label>
                      <select value={payMethod} onChange={e => setPayMethod(e.target.value as any)}
                        className="w-full mt-1 border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white">
                        <option value="cash">نقدًا</option>
                        <option value="bank_transfer">تحويل بنكي</option>
                        <option value="card">بطاقة</option>
                        <option value="other">أخرى</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-500 font-semibold">نوع الدفع</label>
                    <select value={payType} onChange={e => setPayType(e.target.value as any)}
                      className="w-full mt-1 border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white">
                      <option value="private_monthly">شهري (دروس خاصة)</option>
                      <option value="course_one_time">دورة (مرة واحدة)</option>
                    </select>
                  </div>
                  <input value={payNotes} onChange={e => setPayNotes(e.target.value)}
                    placeholder="ملاحظات (اختياري)"
                    className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white" />
                  <div className="flex gap-2">
                    <button type="button" onClick={addPayment} disabled={savingPay || !payAmt}
                      className="flex-1 py-2 bg-black text-white rounded-lg font-bold text-[13px] hover:bg-zinc-800 disabled:opacity-50">
                      {savingPay ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'تسجيل الدفعة'}
                    </button>
                    <button type="button" onClick={() => setShowPayForm(false)}
                      className="px-4 py-2 border border-zinc-200 rounded-lg text-[13px] text-zinc-500">إلغاء</button>
                  </div>
                </div>
              )}

              {payments.length === 0 && !showPayForm && (
                <div className="text-center py-8 text-zinc-400 text-[14px]">لا توجد مدفوعات</div>
              )}

              {payments.map(p => {
                const info    = PAY_STATUS_AR[p.payment_status]
                const receipt = receipts.find(r => r.payment_id === p.id)
                return (
                  <div key={p.id} className="bg-white border border-zinc-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-bold text-[15px]">{Number(p.amount_mad).toLocaleString('ar-MA')} درهم</div>
                        <div className="text-[12px] text-zinc-400">
                          {PAYMENT_TYPE_AR[p.payment_type]}
                          {p.payment_date && ` · ${fmtDate(p.payment_date)}`}
                        </div>
                      </div>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${info.cls}`}>{info.text}</span>
                    </div>
                    {p.notes && <div className="text-[12px] text-zinc-400 mb-2">{p.notes}</div>}
                    <div className="flex gap-2 flex-wrap">
                      {p.payment_status === 'pending' && (
                        <>
                          <button type="button" onClick={() => approve(p.id)} disabled={!!payBusy}
                            className="flex items-center gap-1 text-[12px] font-bold px-3 py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50">
                            {payBusy === p.id ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle size={11} />} قبول
                          </button>
                          <button type="button" onClick={() => decline(p.id)} disabled={!!payBusy}
                            className="flex items-center gap-1 text-[12px] px-3 py-1.5 rounded-lg border border-red-200 text-red-500">
                            <XCircle size={11} /> رفض
                          </button>
                        </>
                      )}
                      {receipt && (
                        <>
                          <button type="button" onClick={() => printReceipt(receipt)}
                            className="flex items-center gap-1 text-[12px] px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-600 hover:bg-zinc-200">
                            <Printer size={11} /> وصل
                          </button>
                          {phone && (
                            <a href={`https://wa.me/${phone.replace(/\D/g,'')}?text=${buildReceiptWhatsAppMessage(receipt)}`}
                              target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[12px] px-3 py-1.5 rounded-lg bg-green-50 text-green-700">
                              <MessageCircle size={11} /> إرسال الوصل
                            </a>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── RECEIPTS ── */}
          {!loading && tab === 'receipts' && (
            <div className="p-5 space-y-3">
              {receipts.length === 0 && (
                <div className="text-center py-8 text-zinc-400 text-[14px]">
                  لا توجد وصولات — تُنشأ تلقائيًا عند قبول الدفع
                </div>
              )}
              {receipts.map(r => (
                <div key={r.id} className="bg-white border border-zinc-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[14px] text-zinc-700">{r.receipt_number}</span>
                    <span className="text-[13px] font-black text-emerald-700">
                      {Number(r.amount_mad).toLocaleString('ar-MA')} درهم
                    </span>
                  </div>
                  <div className="text-[12px] text-zinc-400 mb-3">
                    {fmtDate(r.payment_date)} · {r.course_name ?? '—'}
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => printReceipt(r)}
                      className="flex items-center gap-1 text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-black text-yellow-400 hover:bg-zinc-800">
                      <Printer size={11} /> طباعة / PDF
                    </button>
                    {phone && (
                      <a href={`https://wa.me/${phone.replace(/\D/g,'')}?text=${buildReceiptWhatsAppMessage(r)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600">
                        <MessageCircle size={11} /> إرسال
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── NOTES ── */}
          {!loading && tab === 'notes' && (
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-[14px]">ملاحظات الطالب</span>
                <button type="button" onClick={() => setEditNote(v => !v)}
                  className="flex items-center gap-1 text-[12px] text-zinc-400 hover:text-zinc-700">
                  <Edit3 size={12} /> {editNote ? 'إلغاء' : 'تعديل'}
                </button>
              </div>
              {editNote ? (
                <>
                  <textarea value={noteText} onChange={e => setNoteText(e.target.value)}
                    rows={8} placeholder="أضف ملاحظاتك هنا..."
                    className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-[14px] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                  <button type="button" onClick={saveNote} disabled={savingNote}
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
        </div>
      </aside>
    </>
  )
}

/* ── Helper ────────────────────────────────────────────── */
function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-50 last:border-none">
      <span className="text-[12px] text-zinc-400">{label}</span>
      <span className={`text-[13px] font-semibold ${highlight ? 'text-orange-600' : 'text-zinc-800'}`}>{value}</span>
    </div>
  )
}
