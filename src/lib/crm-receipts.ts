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

/** Build the full HTML string for a receipt. Used both in modal and in print. */
export function buildReceiptHtml(receipt: CrmReceipt, issuerName?: string): string {
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('ar-MA', { year: 'numeric', month: 'long', day: 'numeric' })

  const courseLabel = receipt.course_name ?? '—'
  const method      = PAYMENT_METHODS.find(m => m.id === receipt.payment_method)?.labelAr ?? receipt.payment_method
  const typeLabel   = receipt.payment_type === 'course_one_time' ? 'دورة تدريبية (دفعة واحدة)' : 'دروس خاصة (شهرية)'

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>وصل دفع — ${receipt.receipt_number}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Tahoma,Arial,sans-serif;background:#f8f8f7;color:#111;padding:24px 16px}
  .page{max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
  .header{background:#111;padding:24px 28px;display:flex;align-items:center;justify-content:space-between}
  .brand{display:flex;align-items:center;gap:12px}
  .brand-icon{width:44px;height:44px;background:#facc15;border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:20px;color:#000;flex-shrink:0}
  .brand-name{font-size:18px;font-weight:800;color:#fff}
  .brand-sub{font-size:11px;color:#999;margin-top:2px}
  .badge{background:#22c55e;color:#fff;padding:6px 14px;border-radius:20px;font-weight:700;font-size:13px;white-space:nowrap}
  .body{padding:28px}
  .receipt-meta{margin-bottom:24px}
  .receipt-num-label{font-size:11px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:.08em}
  .receipt-num{font-size:22px;font-weight:900;color:#111;margin:4px 0}
  .receipt-date{font-size:13px;color:#6b7280}
  .divider{border:none;border-top:1px solid #f3f4f6;margin:20px 0}
  .section-label{font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.1em;margin-bottom:12px}
  .row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #f9fafb}
  .row:last-child{border-bottom:none}
  .row-label{font-size:13px;color:#6b7280}
  .row-value{font-size:13px;font-weight:600;color:#111;text-align:left;direction:ltr}
  .amount-block{background:#111;border-radius:12px;padding:20px 24px;margin:24px 0;display:flex;justify-content:space-between;align-items:center}
  .amount-label{font-size:13px;color:#facc15;opacity:.8}
  .amount-value{font-size:28px;font-weight:900;color:#facc15;letter-spacing:-1px}
  .notes{background:#f9fafb;border-radius:10px;padding:12px 16px;font-size:13px;color:#374151;margin-top:8px}
  .footer{text-align:center;color:#9ca3af;font-size:12px;padding:0 0 8px;line-height:1.8}
  .print-btn{display:block;width:100%;margin-top:24px;padding:14px;background:#111;color:#facc15;border:none;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit}
  .print-btn:hover{background:#222}
  @media print{
    body{background:#fff;padding:0}
    .page{box-shadow:none;border-radius:0}
    .print-btn{display:none}
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
        <div class="brand-sub">منصة تعلم الإنجليزية</div>
      </div>
    </div>
    <div class="badge">✓ مدفوع</div>
  </div>

  <div class="body">
    <div class="receipt-meta">
      <div class="receipt-num-label">رقم الوصل</div>
      <div class="receipt-num">${receipt.receipt_number}</div>
      <div class="receipt-date">تاريخ الإصدار: ${fmtDate(receipt.issued_at)}</div>
    </div>

    <hr class="divider">

    <div class="section-label">معلومات الطالب</div>
    <div class="row"><span class="row-label">الاسم الكامل</span><span class="row-value">${receipt.full_name}</span></div>
    ${receipt.phone_number ? `<div class="row"><span class="row-label">رقم الهاتف</span><span class="row-value">${receipt.phone_number}</span></div>` : ''}

    <hr class="divider">

    <div class="section-label">تفاصيل الخدمة</div>
    <div class="row"><span class="row-label">الخدمة / الدورة</span><span class="row-value">${courseLabel}</span></div>
    <div class="row"><span class="row-label">نوع الدفع</span><span class="row-value">${typeLabel}</span></div>
    <div class="row"><span class="row-label">طريقة الدفع</span><span class="row-value">${method}</span></div>
    <div class="row"><span class="row-label">تاريخ الدفع</span><span class="row-value">${fmtDate(receipt.payment_date)}</span></div>
    ${issuerName ? `<div class="row"><span class="row-label">سُجِّل بواسطة</span><span class="row-value">${issuerName}</span></div>` : ''}

    <div class="amount-block">
      <span class="amount-label">المبلغ المدفوع</span>
      <span class="amount-value">${Number(receipt.amount_mad).toLocaleString('ar-MA')} درهم</span>
    </div>

    ${receipt.notes ? `<div class="section-label">ملاحظات</div><div class="notes">${receipt.notes}</div>` : ''}

    <div class="footer">
      <p>شكرًا لثقتك في Inglizi.com 🎓</p>
      <p>هذا الوصل صادر تلقائيًا ويُعتبر دليل دفع رسمي</p>
    </div>

    <button class="print-btn" onclick="window.print()">🖨️ طباعة / تحميل PDF</button>
  </div>
</div>
</body>
</html>`
}

/**
 * Show receipt in a fullscreen modal overlay inside the current page.
 * Avoids popup blockers. The modal contains an iframe with the receipt HTML.
 * Call from React: inject the iframe directly into the DOM.
 */
export function printReceipt(receipt: CrmReceipt, issuerName?: string) {
  const html = buildReceiptHtml(receipt, issuerName)

  // Remove any existing receipt overlay
  document.getElementById('__receipt_overlay__')?.remove()

  const overlay = document.createElement('div')
  overlay.id    = '__receipt_overlay__'
  Object.assign(overlay.style, {
    position:        'fixed',
    inset:           '0',
    zIndex:          '9999',
    background:      'rgba(0,0,0,0.7)',
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    padding:         '16px',
  })

  const container = document.createElement('div')
  Object.assign(container.style, {
    background:    '#fff',
    borderRadius:  '16px',
    width:         '100%',
    maxWidth:      '600px',
    maxHeight:     '90vh',
    overflow:      'hidden',
    display:       'flex',
    flexDirection: 'column',
    boxShadow:     '0 25px 60px rgba(0,0,0,.4)',
  })

  // Close bar
  const bar = document.createElement('div')
  Object.assign(bar.style, {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    padding:        '12px 16px',
    borderBottom:   '1px solid #e5e7eb',
    flexShrink:     '0',
    direction:      'rtl',
  })
  bar.innerHTML = `
    <span style="font-weight:700;font-size:14px">وصل الدفع</span>
    <button id="__receipt_close__" style="background:#f3f4f6;border:none;cursor:pointer;border-radius:8px;padding:6px 12px;font-size:13px;font-weight:600">✕ إغلاق</button>
  `

  // iframe holds receipt HTML
  const iframe = document.createElement('iframe')
  Object.assign(iframe.style, {
    border:     'none',
    width:      '100%',
    flex:       '1',
    minHeight:  '500px',
  })
  iframe.srcdoc = html

  container.appendChild(bar)
  container.appendChild(iframe)
  overlay.appendChild(container)
  document.body.appendChild(overlay)

  // Close handlers
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove() })
  document.getElementById('__receipt_close__')?.addEventListener('click', () => overlay.remove())
}

/**
 * Ensure a receipt exists for a paid payment, then return it.
 * Auto-creates one (with a real receipt number) if the DB trigger never ran
 * (e.g. payments approved before the receipts system existed).
 */
export async function ensurePaymentReceipt(input: {
  paymentId:     string
  studentId?:    string | null
  leadId?:       string | null
  fullName:      string
  phoneNumber?:  string | null
  courseName?:   string | null
  paymentType:   CrmReceipt['payment_type']
  amountMad:     number
  paymentDate?:  string | null
  paymentMethod?: CrmReceipt['payment_method']
  notes?:        string | null
  issuedById?:   string | null
}): Promise<CrmReceipt | null> {
  const { data: existing } = await supabase
    .from('crm_receipts')
    .select('*')
    .eq('payment_id', input.paymentId)
    .maybeSingle()
  if (existing) return existing as CrmReceipt

  return createManualReceipt({
    paymentId:     input.paymentId,
    studentId:     input.studentId ?? undefined,
    leadId:        input.leadId ?? undefined,
    fullName:      input.fullName,
    phoneNumber:   input.phoneNumber ?? undefined,
    courseName:    input.courseName ?? undefined,
    paymentType:   input.paymentType,
    amountMad:     input.amountMad,
    paymentDate:   input.paymentDate ?? new Date().toISOString().slice(0, 10),
    paymentMethod: input.paymentMethod ?? 'cash',
    notes:         input.notes ?? undefined,
    issuedById:    input.issuedById ?? undefined,
  })
}

/** Build a WhatsApp pre-filled message with receipt summary. */
export function buildReceiptWhatsAppMessage(receipt: CrmReceipt): string {
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('ar-MA', { year: 'numeric', month: 'long', day: 'numeric' })

  return encodeURIComponent(
    `✅ *وصل دفع — Inglizi.com*\n\n` +
    `رقم الوصل: ${receipt.receipt_number}\n` +
    `الاسم: ${receipt.full_name}\n` +
    `الخدمة: ${receipt.course_name ?? '—'}\n` +
    `المبلغ: ${Number(receipt.amount_mad).toLocaleString('ar-MA')} درهم\n` +
    `تاريخ الدفع: ${fmtDate(receipt.payment_date)}\n\n` +
    `شكرًا لثقتك في Inglizi.com 🎓`
  )
}
