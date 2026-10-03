'use client'

/* PaymentsTab — CRM student profile: the "payments" tab, split out of page.tsx.
   Payments and invoices: record a payment, split payments, receipts.
   The page owns all state and data; this file only draws the tab from
   the values it is handed (props generated from what the JSX uses). */

import { MessageCircle, Loader2, Printer, CheckCircle, XCircle, Plus } from 'lucide-react'

import { type CrmPayment } from '@/lib/crm-types'
import { type CrmReceipt } from '@/lib/crm-receipts'
import { MAD, fmtDate, PAY_STATUS_AR, PAYMENT_TYPE_AR } from '../_parts'

import type { Dispatch, SetStateAction } from 'react'

export interface PaymentsTabProps {
  addPayment: () => Promise<void>
  approve: (pid: string) => Promise<void>
  decline: (pid: string) => Promise<void>
  downloadReceipt: (p: CrmPayment) => Promise<void>
  payAmt: string
  payBusy: string | null
  payments: CrmPayment[]
  payNotes: string
  payType: "course_one_time" | "private_monthly"
  phone: string
  receipts: CrmReceipt[]
  remindPayment: (p: CrmPayment) => Promise<void>
  savingPay: boolean
  sendReceipt: (p: CrmPayment) => Promise<void>
  setPayAmt: Dispatch<SetStateAction<string>>
  setPayNotes: Dispatch<SetStateAction<string>>
  setPayType: Dispatch<SetStateAction<"course_one_time" | "private_monthly">>
  setShowPayForm: Dispatch<SetStateAction<boolean>>
  setSplitDate: Dispatch<SetStateAction<string>>
  setSplitFirst: Dispatch<SetStateAction<string>>
  setSplitOn: Dispatch<SetStateAction<boolean>>
  showPayForm: boolean
  splitDate: string
  splitFirst: string
  splitOn: boolean
}

export default function PaymentsTab({ addPayment, approve, decline, downloadReceipt, payAmt, payBusy, payments, payNotes, payType, phone, receipts, remindPayment, savingPay, sendReceipt, setPayAmt, setPayNotes, setPayType, setShowPayForm, setSplitDate, setSplitFirst, setSplitOn, showPayForm, splitDate, splitFirst, splitOn }: PaymentsTabProps) {
  return (
    <>
          <div className="space-y-3">
            <button onClick={() => setShowPayForm(v => !v)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-zinc-200 text-zinc-500 hover:border-yellow-400 hover:text-yellow-600 font-semibold text-[13px]">
              <Plus size={15} /> إضافة دفعة / فاتورة
            </button>

            {showPayForm && (
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-3">
                {/* split into two installments */}
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <div onClick={() => setSplitOn(v => !v)}
                    className={`w-9 h-5 rounded-full transition-colors flex items-center ${splitOn ? 'bg-blue-500' : 'bg-zinc-200'}`}>
                    <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform mx-0.5 ${splitOn ? 'translate-x-4' : ''}`} />
                  </div>
                  <span className="text-[13px] font-bold text-zinc-700">💳 تقسيط على دفعتين</span>
                  <span className="text-[11px] text-zinc-400">يدفع جزءًا الآن والباقي في موعد محدد</span>
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-zinc-500 font-semibold">{splitOn ? 'المبلغ الإجمالي (د.م)' : 'المبلغ (د.م)'}</label>
                    <input type="number" value={payAmt} onChange={e => setPayAmt(e.target.value)} dir="ltr"
                      className="w-full mt-1 border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white" placeholder="0" />
                  </div>
                  {splitOn ? (
                    <div>
                      <label className="text-[11px] text-zinc-500 font-semibold">الدفعة الأولى — تُقبض الآن (د.م)</label>
                      <input type="number" value={splitFirst} onChange={e => setSplitFirst(e.target.value)} dir="ltr"
                        className="w-full mt-1 border border-blue-200 rounded-lg px-3 py-2 text-[13px] bg-white" placeholder="0" />
                    </div>
                  ) : (
                    <div>
                      <label className="text-[11px] text-zinc-500 font-semibold">النوع</label>
                      <select value={payType} onChange={e => setPayType(e.target.value as any)}
                        className="w-full mt-1 border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white">
                        <option value="private_monthly">شهري (خاص)</option>
                        <option value="course_one_time">دورة (مرة واحدة)</option>
                      </select>
                    </div>
                  )}
                </div>

                {splitOn && (
                  <div className="grid grid-cols-2 gap-3 items-end">
                    <div>
                      <label className="text-[11px] text-zinc-500 font-semibold">موعد الدفعة الثانية</label>
                      <input type="date" value={splitDate} onChange={e => setSplitDate(e.target.value)} dir="ltr"
                        className="w-full mt-1 border border-blue-200 rounded-lg px-3 py-2 text-[13px] bg-white" />
                    </div>
                    <div className="text-[12px] font-bold text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                      الدفعة الثانية: {Math.max(0, (parseFloat(payAmt) || 0) - (parseFloat(splitFirst) || 0)).toLocaleString('en-US')} د.م
                      <span className="block text-[10px] font-semibold text-blue-500 mt-0.5">تُسجَّل كدفعة مستحقة مع تذكير تلقائي في لوحة المستحقات</span>
                    </div>
                  </div>
                )}

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
              const dueDays = p.due_date ? Math.ceil((new Date(p.due_date).getTime() - Date.now()) / 86400000) : null
              return (
                <div key={p.id} className="bg-white border border-zinc-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-bold text-[15px] flex items-center gap-2 flex-wrap">
                        {MAD(Number(p.amount_mad))} د.م
                        {p.installment_no && <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">قسط {p.installment_no}/{p.installment_count ?? 2}</span>}
                      </div>
                      <div className="text-[12px] text-zinc-400">{PAYMENT_TYPE_AR[p.payment_type]} {p.payment_date && `· ${fmtDate(p.payment_date)}`}</div>
                      {p.payment_status === 'pending' && p.due_date && (
                        <div className={`text-[11px] font-bold mt-0.5 ${dueDays != null && dueDays < 0 ? 'text-red-600' : 'text-amber-600'}`}>
                          {dueDays != null && dueDays < 0 ? `⚠ متأخرة ${Math.abs(dueDays)} يوم` : `⏳ تُستحق ${fmtDate(p.due_date)}`}
                          {p.reminder_sent_at && <span className="text-zinc-400 font-semibold"> · آخر تذكير {fmtDate(p.reminder_sent_at)}</span>}
                        </div>
                      )}
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
                        {p.due_date && (
                          <button onClick={() => remindPayment(p)} disabled={!!payBusy}
                            className="flex items-center gap-1 text-[12px] font-bold px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50">
                            <MessageCircle size={11} /> تذكير بالدفعة
                          </button>
                        )}
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
    </>
  )
}
