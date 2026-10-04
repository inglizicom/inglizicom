import { supabase } from './supabase'

/**
 * Teachers a founder allowed add their own students; staff review them. Money
 * is counted per teacher from the payments linked to their lessons, and
 * payments linked to no teacher on their own row.
 * See supabase/migrations/059_teacher_added_students.sql and 061.
 */

export type ReviewStatus = 'pending' | 'approved' | 'rejected'
export type StudentKind = 'group' | 'private'
export type PayKind = 'monthly' | 'full_course' | 'private_lessons' | 'other'

const RECEIPTS = 'payment-receipts'

const arabic = (msg: string): string => {
  if (/valid phone/i.test(msg)) return 'أدخل رقم هاتف صحيحًا.'
  if (/full name/i.test(msg)) return 'أدخل اسم الطالب الكامل.'
  if (/valid amount/i.test(msg)) return 'أدخل مبلغًا صحيحًا.'
  if (/not one of yours/i.test(msg)) return 'هذا الطالب ليس من طلابك.'
  if (/already reviewed/i.test(msg)) return 'تمت مراجعة هذا الطالب من قبل.'
  if (/not enabled/i.test(msg)) return 'إضافة الطلاب غير مفعّلة لحسابك — الأكاديمية تُسند إليك الطلاب.'
  if (/only be linked to a teacher/i.test(msg)) return 'يمكن ربط الدفعة بأستاذ فقط.'
  return msg
}
async function call<T>(fn: string, args: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabase.rpc(fn, args)
  if (error) throw new Error(arabic(error.message))
  return data as T
}

/* ── Teacher ─────────────────────────────────────────────── */

export interface AddStudentResult {
  result: 'created' | 'linked'
  student_id: string
  seat: 'seated' | 'waitlisted' | 'already_seated' | 'not_your_class' | string | null
  review_status: ReviewStatus
}

export function teacherAddStudent(input: {
  fullName: string; phone: string; level?: string | null; kind: StudentKind
  classId?: string | null; note?: string | null; country?: string | null
}): Promise<AddStudentResult> {
  return call('teacher_add_student', {
    p_full_name: input.fullName, p_phone: input.phone, p_level: input.level ?? null, p_kind: input.kind,
    p_class_id: input.classId ?? null, p_note: input.note ?? null, p_country: input.country ?? null,
  })
}

/** Upload a receipt photo to the teacher's own folder; returns its storage path. */
export async function uploadReceipt(teacherId: string, file: File): Promise<string> {
  const safe = file.name.replace(/[^\w.\-]/g, '_').slice(-60)
  const path = `${teacherId}/${Date.now()}-${safe}`
  const { error } = await supabase.storage.from(RECEIPTS).upload(path, file, { upsert: false, contentType: file.type })
  if (error) throw new Error('تعذّر رفع صورة الوصل: ' + error.message)
  return path
}

export function teacherDeclarePayment(input: {
  studentId: string; amount: number; method: string; paidOn?: string | null; kind?: PayKind
  reference?: string | null; note?: string | null; receiptPath?: string | null
}): Promise<{ id: string; amount_mad: number; payment_status: string }> {
  return call('teacher_declare_payment', {
    p_student: input.studentId, p_amount: input.amount, p_method: input.method, p_paid_on: input.paidOn ?? null,
    p_kind: input.kind ?? 'monthly', p_reference: input.reference ?? null, p_note: input.note ?? null,
    p_receipt_path: input.receiptPath ?? null,
  })
}

export interface AddedStudent {
  id: string; full_name: string; phone: string | null; level: string | null; kind: StudentKind
  review_status: ReviewStatus; review_note: string | null; created_at: string; paid: number; pending: number
}
export async function fetchTeacherAddedStudents(): Promise<AddedStudent[]> {
  const rows = await call<any[]>('teacher_added_students')
  return (rows ?? []).map(r => ({ ...r, paid: Number(r.paid ?? 0), pending: Number(r.pending ?? 0) }))
}

/* ── Staff ───────────────────────────────────────────────── */

export interface DeclaredPayment {
  id: string; amount_mad: number; payment_method: string | null; payment_date: string | null
  notes: string | null; receipt_path: string | null; payment_status: string
}
export interface IntakeItem {
  id: string; full_name: string; phone: string | null; level: string | null; kind: StudentKind
  note: string | null; created_at: string; review_status: ReviewStatus
  teacher_id: string | null; teacher_name: string | null; payments: DeclaredPayment[]
}
export async function fetchTeacherIntake(): Promise<IntakeItem[]> {
  const rows = await call<any[]>('staff_teacher_intake')
  return (rows ?? []).map(r => ({ ...r, payments: (r.payments ?? []).map((p: any) => ({ ...p, amount_mad: Number(p.amount_mad) })) }))
}

export function reviewTeacherStudent(studentId: string, approve: boolean, note?: string | null)
  : Promise<{ id: string; review_status: ReviewStatus; verification_token: string | null }> {
  return call('staff_review_teacher_student', { p_student: studentId, p_approve: approve, p_note: note ?? null })
}

/** Confirm (→ revenue) or decline a payment a teacher declared. */
export async function settleDeclaredPayment(paymentId: string, staffId: string, confirm: boolean): Promise<void> {
  const patch = confirm
    ? { payment_status: 'paid', approved_by_id: staffId, approved_at: new Date().toISOString() }
    : { payment_status: 'declined', approved_by_id: staffId, approved_at: new Date().toISOString() }
  const { error } = await supabase.from('crm_payments').update(patch).eq('id', paymentId)
  if (error) throw new Error(error.message)
}

/** A short-lived link to a teacher's receipt photo (the bucket is private). */
export async function receiptUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage.from(RECEIPTS).createSignedUrl(path, 600)
  return error ? null : data.signedUrl
}

export interface Side {
  teacher_id: string | null; is_academy: boolean; name: string
  students: number; active: number; pending_review: number
  revenue_period: number; revenue_total: number; awaiting_confirmation: number
}
export async function fetchSides(from?: string | null, to?: string | null): Promise<{ from: string; to: string; sides: Side[] }> {
  const r = await call<any>('staff_sides_breakdown', { p_from: from ?? null, p_to: to ?? null })
  return {
    from: r.from, to: r.to,
    sides: (r.sides ?? []).map((s: any) => ({
      ...s, revenue_period: Number(s.revenue_period), revenue_total: Number(s.revenue_total),
      awaiting_confirmation: Number(s.awaiting_confirmation),
    })),
  }
}

/* ── Which teacher a payment is for (061) ────────────────── */

export interface PaymentTeacherOption { teacher_id: string; name: string; via: string | null }
/** Every active teacher; those linked to this student first, with how (class / assignment). */
export function fetchPaymentTeacherOptions(studentId: string): Promise<PaymentTeacherOption[]> {
  return call<PaymentTeacherOption[]>('staff_payment_teacher_options', { p_student: studentId }).then(r => r ?? [])
}
/** Link a payment to the teacher whose lessons it pays for (null = unlink). */
export function setPaymentTeacher(paymentId: string, teacherId: string | null): Promise<unknown> {
  return call('staff_set_payment_teacher', { p_payment: paymentId, p_teacher: teacherId })
}

export const PAY_METHOD_AR: Record<string, string> = {
  cash: 'نقدًا', bank_transfer: 'تحويل بنكي', wafacash: 'وفاكاش', cashplus: 'كاش بلوس', card: 'بطاقة', paypal: 'PayPal', other: 'أخرى',
}
