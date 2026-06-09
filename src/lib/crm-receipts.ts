import { supabase } from './supabase'

export interface CrmReceipt {
  id:             string
  receipt_number: string
  payment_id:     string | null
  lead_id:        string | null
  student_id:     string | null
  full_name:      string
  phone_number:   string | null
  course_name:    string | null
  payment_type:   'course_one_time' | 'private_monthly'
  amount_mad:     number
  payment_date:   string
  payment_method: 'cash' | 'bank_transfer' | 'card' | 'other'
  notes:          string | null
  issued_by_id:   string | null
  issued_at:      string
  created_at:     string
}

export const PAYMENT_METHODS: { id: CrmReceipt['payment_method']; label: string; labelAr: string }[] = [
  { id: 'cash',          label: 'Cash',          labelAr: 'نقدًا' },
  { id: 'bank_transfer', label: 'Bank Transfer',  labelAr: 'تحويل بنكي' },
  { id: 'card',          label: 'Card',           labelAr: 'بطاقة' },
  { id: 'other',         label: 'Other',          labelAr: 'أخرى' },
]

export async function fetchReceiptsForLead(leadId: string): Promise<CrmReceipt[]> {
  const { data, error } = await supabase
    .from('crm_receipts')
    .select('*')
    .eq('lead_id', leadId)
    .order('issued_at', { ascending: false })
  if (error) { console.error('fetchReceiptsForLead', error.message); return [] }
  return (data ?? []) as CrmReceipt[]
}

export async function fetchReceiptsForStudent(studentId: string): Promise<CrmReceipt[]> {
  const { data, error } = await supabase
    .from('crm_receipts')
    .select('*')
    .eq('student_id', studentId)
    .order('issued_at', { ascending: false })
  if (error) { console.error('fetchReceiptsForStudent', error.message); return [] }
  return (data ?? []) as CrmReceipt[]
}

export async function fetchReceiptById(id: string): Promise<CrmReceipt | null> {
  const { data } = await supabase
    .from('crm_receipts')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  return (data ?? null) as CrmReceipt | null
}

export async function createManualReceipt(input: {
  paymentId?:    string
  leadId?:       string
  studentId?:    string
  fullName:      string
  phoneNumber?:  string
  courseName?:   string
  paymentType:   CrmReceipt['payment_type']
  amountMad:     number
  paymentDate:   string
  paymentMethod: CrmReceipt['payment_method']
  notes?:        string
  issuedById?:   string
}): Promise<CrmReceipt | null> {
  const { data, error } = await supabase
    .from('crm_receipts')
    .insert({
      payment_id:     input.paymentId,
      lead_id:        input.leadId,
      student_id:     input.studentId,
      full_name:      input.fullName,
      phone_number:   input.phoneNumber,
      course_name:    input.courseName,
      payment_type:   input.paymentType,
      amount_mad:     input.amountMad,
      payment_date:   input.paymentDate,
      payment_method: input.paymentMethod,
      notes:          input.notes,
      issued_by_id:   input.issuedById,
    })
    .select()
    .single()
  if (error) { console.error('createManualReceipt', error.message); return null }
  return data as CrmReceipt
}

export async function fetchRecentReceipts(limit = 20): Promise<CrmReceipt[]> {
  const { data, error } = await supabase
    .from('crm_receipts')
    .select('*')
    .order('issued_at', { ascending: false })
    .limit(limit)
  if (error) { console.error('fetchRecentReceipts', error.message); return [] }
  return (data ?? []) as CrmReceipt[]
}

/** Open a printable receipt in a new browser tab. Works without any PDF library. */
export function printReceipt(receipt: CrmReceipt, issuerName?: string) {
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('ar-MA', { year: 'numeric', month: 'long', day: 'numeric' })

  const courseLabel = receipt.course_name ?? '—'
  const method = PAYMENT_METHODS.find(m => m.id === receipt.payment_method)?.labelAr ?? receipt.payment_method
  const typeLabel = receipt.payment_type === 'course_one_time' ? 'دورة تدريبية (دفعة واحدة)' : 'دروس خاصة (شهرية)'

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<title>وصل دفع — ${receipt.receipt_number}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background: #fff; color: #111; }
  .page { max-width: 600px; margin: 40px auto; padding: 40px; border: 1px solid #e5e7eb; border-radius: 12px; }
  .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }
  .brand { display: flex; align-items: center; gap: 12px; }
  .brand-icon { width: 48px; height: 48px; background: #facc15; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 22px; }
  .brand-name { font-size: 20px; font-weight: 800; }
  .brand-sub { font-size: 12px; color: #6b7280; }
  .badge-paid { background: #dcfce7; color: #166534; padding: 6px 16px; border-radius: 20px; font-weight: 700; font-size: 14px; }
  .receipt-num { font-size: 13px; color: #6b7280; margin-bottom: 4px; }
  .receipt-title { font-size: 24px; font-weight: 800; margin-bottom: 4px; }
  .receipt-date { font-size: 13px; color: #6b7280; }
  .divider { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
  .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #9ca3af; letter-spacing: 0.1em; margin-bottom: 12px; }
  .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
  .row:last-child { border-bottom: none; }
  .row-label { color: #6b7280; font-size: 14px; }
  .row-value { font-weight: 600; font-size: 14px; text-align: left; direction: ltr; }
  .amount-box { background: #111; color: #facc15; border-radius: 10px; padding: 20px 24px; margin: 24px 0; display: flex; justify-content: space-between; align-items: center; }
  .amount-label { font-size: 14px; opacity: 0.7; }
  .amount-value { font-size: 28px; font-weight: 900; letter-spacing: -0.5px; }
  .footer { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 32px; }
  .notes-box { background: #f9fafb; border-radius: 8px; padding: 12px 16px; font-size: 14px; color: #374151; margin-top: 8px; }
  @media print {
    body { background: white; }
    .page { border: none; box-shadow: none; margin: 0; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="brand">
      <div class="brand-icon">I</div>
      <div>
        <div class="brand-name">Inglizi.com</div>
        <div class="brand-sub">منصة تعليم اللغة الإنجليزية</div>
      </div>
    </div>
    <div class="badge-paid">✓ مدفوع</div>
  </div>

  <div>
    <div class="receipt-num">رقم الوصل</div>
    <div class="receipt-title">${receipt.receipt_number}</div>
    <div class="receipt-date">تاريخ الإصدار: ${fmtDate(receipt.issued_at)}</div>
  </div>

  <hr class="divider">

  <div class="section-title">معلومات الطالب</div>
  <div class="row"><span class="row-label">الاسم الكامل</span><span class="row-value">${receipt.full_name}</span></div>
  ${receipt.phone_number ? `<div class="row"><span class="row-label">رقم الهاتف</span><span class="row-value">${receipt.phone_number}</span></div>` : ''}

  <hr class="divider">

  <div class="section-title">تفاصيل الخدمة</div>
  <div class="row"><span class="row-label">الخدمة / الدورة</span><span class="row-value">${courseLabel}</span></div>
  <div class="row"><span class="row-label">نوع الدفع</span><span class="row-value">${typeLabel}</span></div>
  <div class="row"><span class="row-label">طريقة الدفع</span><span class="row-value">${method}</span></div>
  <div class="row"><span class="row-label">تاريخ الدفع</span><span class="row-value">${fmtDate(receipt.payment_date)}</span></div>
  ${issuerName ? `<div class="row"><span class="row-label">سُجِّل بواسطة</span><span class="row-value">${issuerName}</span></div>` : ''}

  <div class="amount-box">
    <span class="amount-label">المبلغ المدفوع</span>
    <span class="amount-value">${receipt.amount_mad.toLocaleString('ar-MA')} درهم</span>
  </div>

  ${receipt.notes ? `<div class="section-title">ملاحظات</div><div class="notes-box">${receipt.notes}</div>` : ''}

  <div class="footer">
    <p>شكرًا لثقتك في Inglizi.com</p>
    <p style="margin-top:4px">هذا الوصل صادر تلقائيًا ويُعتبر دليل دفع رسمي</p>
  </div>

  <div class="no-print" style="margin-top:24px;display:flex;gap:12px;justify-content:center">
    <button onclick="window.print()" style="background:#111;color:#facc15;border:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:15px;cursor:pointer">طباعة / تحميل PDF</button>
    <button onclick="window.close()" style="background:#f3f4f6;color:#374151;border:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:15px;cursor:pointer">إغلاق</button>
  </div>
</div>
</body>
</html>`

  const win = window.open('', '_blank')
  if (win) {
    win.document.write(html)
    win.document.close()
  }
}

/** Build a WhatsApp message with receipt summary. */
export function buildReceiptWhatsAppMessage(receipt: CrmReceipt): string {
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('ar-MA', { year: 'numeric', month: 'long', day: 'numeric' })

  return encodeURIComponent(
    `✅ *وصل دفع — Inglizi.com*\n\n` +
    `رقم الوصل: ${receipt.receipt_number}\n` +
    `الاسم: ${receipt.full_name}\n` +
    `الخدمة: ${receipt.course_name ?? '—'}\n` +
    `المبلغ: ${receipt.amount_mad.toLocaleString('ar-MA')} درهم\n` +
    `تاريخ الدفع: ${fmtDate(receipt.payment_date)}\n\n` +
    `شكرًا لثقتك في Inglizi.com 🎓`
  )
}
