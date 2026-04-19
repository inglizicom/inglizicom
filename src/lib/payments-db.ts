import { supabase } from './supabase'

export type PaymentStatus = 'pending' | 'approved' | 'declined'
export type PaymentMethod = 'receipt' | 'stripe'

export interface Payment {
  id:              string
  user_id:         string
  method:          PaymentMethod
  external_id:     string | null
  plan_requested:  string
  amount:          number
  currency:        string
  duration_months: number
  receipt_path:    string | null
  status:          PaymentStatus
  decline_reason:  string | null
  user_note:       string | null
  reviewed_by:     string | null
  reviewed_at:     string | null
  created_at:      string
}

export interface PaymentWithProfile extends Payment {
  profile: { email: string | null; full_name: string | null } | null
}

const BUCKET = 'payment-receipts'

export async function fetchMyPayments(): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('fetchMyPayments', error.message)
    return []
  }
  return (data ?? []) as Payment[]
}

export async function fetchAllPayments(
  status?: PaymentStatus,
): Promise<PaymentWithProfile[]> {
  let q = supabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false })
  if (status) q = q.eq('status', status)
  const { data, error } = await q
  if (error) {
    console.error('fetchAllPayments', error.message)
    return []
  }
  const payments = (data ?? []) as Payment[]
  if (payments.length === 0) return []

  const userIds = Array.from(new Set(payments.map(p => p.user_id)))
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .in('id', userIds)
  const byId = new Map((profiles ?? []).map(p => [p.id, p]))

  return payments.map(p => {
    const pr = byId.get(p.user_id)
    return { ...p, profile: pr ? { email: pr.email, full_name: pr.full_name } : null }
  })
}

export async function countPendingPayments(): Promise<number> {
  const { count, error } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')
  if (error) return 0
  return count ?? 0
}

/**
 * Upload a receipt and create a pending payment row.
 * Receipt path is always `<user_id>/<payment_id>.<ext>` to satisfy RLS.
 */
export async function createPaymentWithReceipt(input: {
  userId:         string
  planId:         string
  amount:         number
  currency:       string
  durationMonths: number
  receipt:        File
  note?:          string
}): Promise<Payment> {
  const { data: payment, error: pErr } = await supabase
    .from('payments')
    .insert({
      user_id:         input.userId,
      method:          'receipt',
      plan_requested:  input.planId,
      amount:          input.amount,
      currency:        input.currency,
      duration_months: input.durationMonths,
      status:          'pending',
      user_note:       input.note ?? null,
    })
    .select()
    .single()
  if (pErr || !payment) throw new Error(pErr?.message ?? 'payment insert failed')

  const ext  = input.receipt.name.split('.').pop()?.toLowerCase() || 'bin'
  const path = `${input.userId}/${payment.id}.${ext}`

  const { error: uErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, input.receipt, {
      cacheControl: '3600',
      upsert:       false,
      contentType:  input.receipt.type || undefined,
    })
  if (uErr) {
    // Clean up the row so the user can retry without a dangling pending payment
    await supabase.from('payments').delete().eq('id', payment.id)
    throw new Error(uErr.message)
  }

  const { data: updated, error: upErr } = await supabase
    .from('payments')
    .update({ receipt_path: path })
    .eq('id', payment.id)
    .select()
    .single()
  if (upErr || !updated) throw new Error(upErr?.message ?? 'path save failed')

  return updated as Payment
}

export async function getReceiptSignedUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 10)
  if (error) {
    console.error('getReceiptSignedUrl', error.message)
    return null
  }
  return data?.signedUrl ?? null
}

export async function approvePayment(id: string, adminId: string) {
  const { error } = await supabase
    .from('payments')
    .update({ status: 'approved', reviewed_by: adminId })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function declinePayment(
  id: string,
  adminId: string,
  reason: string,
) {
  const { error } = await supabase
    .from('payments')
    .update({
      status:         'declined',
      decline_reason: reason,
      reviewed_by:    adminId,
      reviewed_at:    new Date().toISOString(),
    })
    .eq('id', id)
  if (error) throw new Error(error.message)
}
