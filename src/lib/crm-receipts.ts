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
  verification_token?: string | null
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
  verificationToken?: string | null
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
      verification_token: input.verificationToken ?? null,
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
/** Build a bilingual (Arabic + English) two-page receipt as printable HTML. */
export function buildReceiptHtml(
  receipt: CrmReceipt,
  opts?: {
    token?:            string | null
    teacherName?:      string | null
    subscriptionDate?: string | null
    endDate?:          string | null
    issuerName?:       string | null
  },
): string {
  const token   = ((receipt.verification_token || opts?.token || '') as string).toUpperCase() || '—'
  const teacher = opts?.teacherName || 'الأستاذ حمزة'
  const subDate = opts?.subscriptionDate || receipt.payment_date
  const endDate = opts?.endDate || null
  const issuer  = opts?.issuerName || ''
  const amount  = Number(receipt.amount_mad)

  const fmt = (d: string | null | undefined, locale: string) =>
    d ? new Date(d).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' }) : '—'

  const methodAr = PAYMENT_METHODS.find(m => m.id === receipt.payment_method)?.labelAr ?? receipt.payment_method
  const methodEn = PAYMENT_METHODS.find(m => m.id === receipt.payment_method)?.label   ?? receipt.payment_method
  const typeAr   = receipt.payment_type === 'course_one_time' ? 'دورة (دفعة واحدة)' : 'دروس خاصة (شهرية)'
  const typeEn   = receipt.payment_type === 'course_one_time' ? 'Course (one-time)'  : 'Private lessons (monthly)'

  const row = (label: string, value: string) =>
    `<div class="row"><span class="rl">${label}</span><span class="rv">${value}</span></div>`

  const L = {
    ar: {
      sub: 'منصة تعلّم اللغة الإنجليزية', title: 'وصل دفع', rno: 'رقم الوصل', issued: 'تاريخ الإصدار',
      studentInfo: 'معلومات الطالب', name: 'الاسم الكامل', phone: 'رقم الهاتف',
      serviceInfo: 'تفاصيل الاشتراك', course: 'الدورة / الخدمة', teacher: 'الأستاذ',
      type: 'نوع الاشتراك', subDate: 'تاريخ الاشتراك', endDate: 'تاريخ انتهاء الدورة',
      method: 'طريقة الدفع', issuedBy: 'سُجّل بواسطة', amount: 'المبلغ المدفوع', paid: 'مدفوع',
      tokenL: 'رمز التحقق', note: 'يمكن التحقق من صحة هذا الوصل عبر رمز التحقق أعلاه على منصة Inglizi.com.',
      thanks: 'شكراً لثقتك في Inglizi.com',
    },
    en: {
      sub: 'English Learning Platform', title: 'Payment Receipt', rno: 'Receipt No.', issued: 'Issued on',
      studentInfo: 'Student information', name: 'Full name', phone: 'Phone',
      serviceInfo: 'Subscription details', course: 'Course / Service', teacher: 'Teacher',
      type: 'Subscription type', subDate: 'Subscription date', endDate: 'Course end date',
      method: 'Payment method', issuedBy: 'Registered by', amount: 'Amount paid', paid: 'PAID',
      tokenL: 'Verification token', note: 'This receipt can be verified using the token above on the Inglizi.com platform.',
      thanks: 'Thank you for trusting Inglizi.com',
    },
  }

  function page(lang: 'ar' | 'en', last: boolean) {
    const ar = lang === 'ar'
    const t = L[lang]
    const locale = ar ? 'ar-MA' : 'en-GB'
    const method = ar ? methodAr : methodEn
    const type   = ar ? typeAr : typeEn
    const amountStr = ar ? `${amount.toLocaleString('ar-MA')} درهم` : `MAD ${amount.toLocaleString('en-US')}`
    const rows = [
      `<div class="sec">${t.studentInfo}</div>`,
      row(t.name, receipt.full_name),
      receipt.phone_number ? row(t.phone, receipt.phone_number) : '',
      `<div class="sec">${t.serviceInfo}</div>`,
      row(t.course, receipt.course_name ?? '—'),
      row(t.teacher, teacher),
      row(t.type, type),
      row(t.subDate, fmt(subDate, locale)),
      endDate ? row(t.endDate, fmt(endDate, locale)) : '',
      row(t.method, method),
      issuer ? row(t.issuedBy, issuer) : '',
    ].join('')
    return `<div class="page${last ? '' : ' brk'}" dir="${ar ? 'rtl' : 'ltr'}">
      <div class="wm">${token}</div>
      <div class="content">
        <div class="head">
          <div class="brand"><div class="logo">I</div><div><div class="bn">Inglizi.com</div><div class="bs">${t.sub}</div></div></div>
          <div class="badge">✓ ${t.paid}</div>
        </div>
        <div class="meta">
          <div class="rno">${t.rno}</div>
          <div class="rnum">${receipt.receipt_number}</div>
          <div class="rdate">${t.issued}: ${fmt(receipt.issued_at, locale)}</div>
        </div>
        <div class="rows">${rows}</div>
        <div class="amt"><span class="amtl">${t.amount}</span><span class="amtv">${amountStr}</span></div>
        <div class="tok"><span>${t.tokenL}</span><b>${token}</b></div>
        <div class="note">${t.note}</div>
        <div class="thanks">${t.thanks} 🎓</div>
      </div>
    </div>`
  }

  return `<!DOCTYPE html><html lang="ar"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${receipt.receipt_number}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Tahoma,Arial,sans-serif;background:#eceae7;color:#111;padding:20px 12px}
  .page{position:relative;max-width:620px;margin:0 auto 20px;background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:34px 36px;overflow:hidden}
  .wm{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-20deg);width:160%;text-align:center;font-size:94px;font-weight:900;color:rgba(17,17,17,.08);letter-spacing:8px;white-space:nowrap;pointer-events:none;z-index:0;text-transform:uppercase}
  .content{position:relative;z-index:1}
  .head{display:flex;align-items:center;justify-content:space-between;padding-bottom:18px;border-bottom:2px solid #111}
  .brand{display:flex;align-items:center;gap:12px}
  .logo{width:46px;height:46px;background:#facc15;border-radius:11px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:22px;color:#000}
  .bn{font-size:19px;font-weight:800}
  .bs{font-size:11px;color:#6b7280;margin-top:2px}
  .badge{background:#16a34a;color:#fff;padding:6px 16px;border-radius:20px;font-weight:800;font-size:13px;letter-spacing:.5px}
  .meta{margin:20px 0 14px}
  .rno{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#9ca3af}
  .rnum{font-size:22px;font-weight:900;margin:2px 0}
  .rdate{font-size:12px;color:#6b7280}
  .sec{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.12em;color:#9ca3af;margin:16px 0 8px}
  .row{display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid #f3f4f6}
  .rl{font-size:13px;color:#6b7280}
  .rv{font-size:13px;font-weight:600;color:#111}
  .amt{display:flex;justify-content:space-between;align-items:center;background:#111;border-radius:12px;padding:18px 22px;margin:20px 0 14px}
  .amtl{font-size:13px;color:#facc15;opacity:.85}
  .amtv{font-size:25px;font-weight:900;color:#facc15;letter-spacing:-.5px}
  .tok{display:flex;justify-content:space-between;align-items:center;border:2px dashed #d4d4d8;border-radius:10px;padding:11px 16px;background:#fafafa}
  .tok span{font-size:11px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:.1em}
  .tok b{font-size:17px;font-weight:900;letter-spacing:2px;color:#111}
  .note{font-size:11px;color:#9ca3af;text-align:center;margin-top:14px;line-height:1.7}
  .thanks{font-size:13px;color:#374151;text-align:center;margin-top:6px;font-weight:600}
  .print-btn{display:block;width:100%;max-width:620px;margin:4px auto 0;padding:14px;background:#111;color:#facc15;border:none;border-radius:10px;font-size:15px;font-weight:800;cursor:pointer;font-family:inherit}
  @media print{
    body{background:#fff;padding:0}
    .page{border:none;border-radius:0;margin:0;page-break-after:always}
    .page:last-of-type,.page.last{page-break-after:auto}
    .brk{page-break-after:always}
    .no-print{display:none}
  }
</style></head>
<body>
  ${page('ar', false)}
  ${page('en', true)}
  <button class="print-btn no-print" onclick="window.print()">🖨️ طباعة / Print (AR + EN)</button>
</body></html>`
}

/** Show the receipt in a fullscreen in-page modal (avoids popup blockers). */
export function printReceipt(
  receipt: CrmReceipt,
  opts?: {
    token?:            string | null
    teacherName?:      string | null
    subscriptionDate?: string | null
    endDate?:          string | null
    issuerName?:       string | null
  },
) {
  const html = buildReceiptHtml(receipt, opts)

  document.getElementById('__receipt_overlay__')?.remove()

  const overlay = document.createElement('div')
  overlay.id = '__receipt_overlay__'
  Object.assign(overlay.style, {
    position: 'fixed', inset: '0', zIndex: '9999', background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
  })

  const container = document.createElement('div')
  Object.assign(container.style, {
    background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '660px',
    maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
    boxShadow: '0 25px 60px rgba(0,0,0,.4)',
  })

  const bar = document.createElement('div')
  Object.assign(bar.style, {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 16px', borderBottom: '1px solid #e5e7eb', flexShrink: '0', direction: 'rtl',
  })
  bar.innerHTML = `
    <span style="font-weight:700;font-size:14px">وصل الدفع · Receipt</span>
    <button id="__receipt_close__" style="background:#f3f4f6;border:none;cursor:pointer;border-radius:8px;padding:6px 12px;font-size:13px;font-weight:600">✕ إغلاق</button>`

  const iframe = document.createElement('iframe')
  Object.assign(iframe.style, { border: 'none', width: '100%', flex: '1', minHeight: '540px' })
  iframe.srcdoc = html

  container.appendChild(bar)
  container.appendChild(iframe)
  overlay.appendChild(container)
  document.body.appendChild(overlay)

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
  verificationToken?: string | null
}): Promise<CrmReceipt | null> {
  const { data: existing } = await supabase
    .from('crm_receipts')
    .select('*')
    .eq('payment_id', input.paymentId)
    .maybeSingle()

  if (existing) {
    const e = existing as CrmReceipt
    // Repair a stale receipt (generic name / missing token) from current data.
    const needsFix = (!e.full_name || e.full_name === 'طالب') || (!e.verification_token && input.verificationToken)
    if (needsFix && input.fullName) {
      const { data: fixed } = await supabase
        .from('crm_receipts')
        .update({
          full_name:          input.fullName,
          phone_number:       input.phoneNumber ?? e.phone_number,
          course_name:        input.courseName ?? e.course_name,
          verification_token: input.verificationToken ?? e.verification_token,
        })
        .eq('id', e.id)
        .select()
        .single()
      return (fixed ?? e) as CrmReceipt
    }
    return e
  }

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
    verificationToken: input.verificationToken ?? undefined,
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
